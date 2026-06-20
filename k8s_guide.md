# Hướng Dẫn Cấu Hình & Triển Khai Kubernetes (K8s) Cho Người Mới Bắt Đầu

Tài liệu này giải thích các khái niệm cốt lõi của Kubernetes (K8s) thông qua các cấu hình thực tế mà chúng ta vừa thực hiện để chạy hệ thống gồm **API Gateway**, **Account Service** và **PostgreSQL** trên môi trường K8s local (chạy bằng Kind / Docker Desktop).

---

## 1. Các Khái Niệm Cơ Bản Trong K8s Đã Sử Dụng

### Pod là gì?
* **Pod** là đơn vị nhỏ nhất mà K8s quản lý. Một Pod chứa một hoặc nhiều container (ví dụ: container chạy ứng dụng Java JAR). Các container trong cùng một Pod sẽ chia sẻ mạng và ổ đĩa với nhau.

### Deployment (Trình triển khai)
* **Khái niệm**: Quản lý vòng đời của các Pod. Nó định nghĩa container chạy image nào, cấu hình bao nhiêu bản sao (`replicas`), và truyền các biến môi trường (`env`) nào vào.
* **Thực tế**: 
  * [api-gateway.yaml](file:///d:/ecommerce-fashion-website/k8s/api-gateway.yaml) định nghĩa Deployment chạy image `api-gateway:v1`.
  * [account-service.yaml](file:///d:/ecommerce-fashion-website/k8s/account-service.yaml) định nghĩa Deployment chạy image `account-service:v1`.

### Service (Dịch vụ định tuyến)
* **Khái niệm**: Pod có thể bị tắt đi và khởi động lại với một địa chỉ IP mới ngẫu nhiên. **Service** cung cấp một địa chỉ IP tĩnh và tên miền nội bộ (DNS) cố định để các dịch vụ khác có thể gọi tới, tự động cân bằng tải (load balancing) tới các Pod phía sau.
* **Các loại Service thường dùng**:
  1. **ClusterIP** (Mặc định): Chỉ cho phép giao tiếp nội bộ trong mạng K8s. (Ví dụ: [postgres.yaml](file:///d:/ecommerce-fashion-website/k8s/postgres.yaml) dùng ClusterIP vì cơ sở dữ liệu chỉ cần các service nội bộ gọi tới, không nên mở ra ngoài).
  2. **LoadBalancer**: Mở cổng ra ngoài mạng. Trong môi trường local như Kind, bộ quản lý **Kind Cloud Controller Manager** sẽ bắt sự kiện này và tự động tạo một proxy Envoy trên máy tính Windows của bạn để ánh xạ cổng đó ra `localhost`. (Ví dụ: [api-gateway.yaml](file:///d:/ecommerce-fashion-website/k8s/api-gateway.yaml) dùng LoadBalancer để bạn có thể gọi từ Postman trên Windows vào cổng `8080`).

### ConfigMap
* **Khái niệm**: Dùng để lưu trữ các cấu hình tĩnh (tệp cấu hình, biến môi trường, câu lệnh SQL khởi tạo) tách biệt khỏi mã nguồn ứng dụng.
* **Thực tế**: Chúng ta dùng ConfigMap tên `postgres-init-sql` trong [postgres.yaml](file:///d:/ecommerce-fashion-website/k8s/postgres.yaml) để lưu trữ tệp script `init.sql` tạo database `"fashion-account-service"`.

### PersistentVolumeClaim (PVC)
* **Khái niệm**: Yêu cầu K8s cấp phát một không gian lưu trữ dữ liệu vĩnh viễn trên ổ cứng. Khi Pod (như Postgres) bị khởi động lại hoặc cập nhật, dữ liệu đã lưu trong thư mục này sẽ **không bị mất**.

---

## 2. Chi Tiết Các Lỗi Đã Gặp & Cách Khắc Phục

### Lỗi 1: `account-service` bị lỗi khởi động (CrashLoopBackOff)
* **Nguyên nhân**: Trong mã nguồn Java, class `AuthServiceImpl.java` yêu cầu lấy giá trị khóa ký JWT: `@Value("${spring.jwt.signerkey}")`. Tuy nhiên, trong tệp cấu hình [application.properties](file:///d:/ecommerce-fashion-website/account-service/src/main/resources/application.properties) lại chưa hề khai báo thuộc tính này.
* **Cách sửa**: Khai báo thuộc tính này trong file properties và cấu hình cho phép ghi đè từ biến môi trường `JWT_SECRET` (được truyền vào từ K8s deployment):
  ```properties
  spring.jwt.signerkey=${JWT_SECRET:isxtj7Ez9VtK5s8+/jWnbGUAzo+/LaHlz8Py+7gT07bwtMSV3yfKDkNvDnfKoevA}
  ```

### Lỗi 2: PostgreSQL chưa khởi tạo Database `fashion-account-service`
* **Nguyên nhân**: Container Postgres mặc định chỉ tạo cơ sở dữ liệu `postgres`. Ứng dụng `account-service` kết nối tới database `/fashion-account-service` nên gặp lỗi không tìm thấy cơ sở dữ liệu. Ở môi trường docker-compose, việc này được giải quyết nhờ mount file `init.sql`, nhưng trên K8s thì thiếu cấu hình này.
* **Cách sửa**: 
  1. Tạo `ConfigMap` chứa nội dung file SQL:
     ```yaml
     apiVersion: v1
     kind: ConfigMap
     metadata:
       name: postgres-init-sql
     data:
       init.sql: |
         CREATE DATABASE "fashion-account-service";
         GRANT ALL PRIVILEGES ON DATABASE "fashion-account-service" TO app_user;
     ```
  2. Mount ConfigMap này vào thư mục tự động chạy script của Postgres container (`/docker-entrypoint-initdb.d`):
     ```yaml
     # Trong container spec
     volumeMounts:
       - mountPath: /docker-entrypoint-initdb.d
         name: postgres-init-volume
     # Định nghĩa Volume ở dưới
     volumes:
       - name: postgres-init-volume
         configMap:
           name: postgres-init-sql
     ```

### Lỗi 3: Không truy cập được API Gateway từ Postman (`ECONNREFUSED`)
* **Nguyên nhân**: Dịch vụ `LoadBalancer` của API Gateway trên K8s nội bộ chưa được đồng bộ ánh xạ cổng ra ngoài máy Windows.
* **Cách sửa**: 
  * Cập nhật cổng expose trong [Dockerfile](file:///d:/ecommerce-fashion-website/api-gateway/Dockerfile) thành `EXPOSE 8080` cho chuẩn hóa.
  * Chạy lại cấu hình Service bằng cách xóa và apply lại file yaml:
    ```powershell
    kubectl apply -f k8s/api-gateway.yaml
    ```
    Hành động này kích hoạt Kind CCM tự động tạo proxy liên kết cổng `localhost:8080` của Windows trực tiếp tới cổng `8080` của API Gateway trong K8s.

---

## 3. Quy Trình Vận Hành & Triển Khai Dự Án Trên K8s (Các bước khi code thay đổi)

Mỗi khi bạn thực hiện thay đổi mã nguồn ở các dịch vụ, hãy làm theo các bước sau để cập nhật lên Kubernetes:

### Bước 1: Build lại Docker Image của dịch vụ
Di chuyển vào thư mục dự án và chạy các lệnh build:
```powershell
# Build image cho Account Service
docker build -t account-service:v1 ./account-service

# Build image cho API Gateway
docker build -t api-gateway:v1 ./api-gateway
```

### Bước 2: Nạp Docker Image vào K8s Cluster (Kind)
Vì Kind chạy trên container Docker biệt lập, nó cần được nạp trực tiếp file ảnh Docker vừa build ở máy bạn vào hệ thống lưu trữ của nó:
```powershell
# Sử dụng cmd để tránh lỗi định dạng tar của PowerShell khi pipe dữ liệu nhị phân:
cmd /c "docker save account-service:v1 | docker exec -i desktop-control-plane ctr -n k8s.io images import -"
cmd /c "docker save api-gateway:v1 | docker exec -i desktop-control-plane ctr -n k8s.io images import -"
```

### Bước 3: Áp dụng (Apply) các cấu hình K8s
Chạy lệnh apply để K8s cập nhật hoặc tạo mới các tài nguyên:
```powershell
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/account-service.yaml
kubectl apply -f k8s/api-gateway.yaml
```

### Bước 4: Khởi động lại các Pod để chạy phiên bản mới nhất
```powershell
kubectl rollout restart deployment/account-service
kubectl rollout restart deployment/api-gateway
```

### Bước 5: Kiểm tra trạng thái ứng dụng
```powershell
# Kiểm tra xem các Pod đã ở trạng thái "Running" hay chưa
kubectl get pods

# Xem log trực tiếp của dịch vụ (ví dụ account-service) để kiểm tra lỗi khởi động
kubectl logs deployment/account-service -f
```
