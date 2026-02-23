<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

trait SecureFileUpload
{
    /**
     * Upload a file securely.
     *
     * @param UploadedFile $file The file to upload
     * @param string $path The storage path (folder)
     * @param string $disk The storage disk (default: public)
     * @return string|false The path of the uploaded file or false on failure
     */
    protected function uploadSecurely(UploadedFile $file, string $path = 'uploads', string $disk = 'public')
    {
        // 1. Verify it's a valid image/file by content (MIME)
        if (!$file->isValid()) {
            return false;
        }

        // Additional MIME check for images using getimagesize
        if (str_starts_with($file->getMimeType(), 'image/')) {
            if (@getimagesize($file->getPathname()) === false) {
                return false; // Not a valid image
            }
        }

        // 2. Generate a secure, random filename (UUID)
        $extension = $file->guessExtension();
        if (!$extension) {
            $extension = 'bin'; // Fallback
        }
        
        $filename = Str::uuid() . '.' . $extension;

        // 3. Store the file
        return $file->storeAs($path, $filename, $disk);
    }
}
