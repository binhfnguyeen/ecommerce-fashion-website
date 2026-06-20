package com.heulwen.mediaservice.controller;

import com.heulwen.mediaservice.api.response.UploadResponse;
import com.heulwen.mediaservice.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileName = fileStorageService.storeFile(file);
        String url = "/api/media/images/" + fileName;
        return new ResponseEntity<>(new UploadResponse(fileName, url), HttpStatus.CREATED);
    }
}
