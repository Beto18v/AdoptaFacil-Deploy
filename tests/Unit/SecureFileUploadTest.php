<?php

use App\Traits\SecureFileUpload;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class TestSecureUploader
{
    use SecureFileUpload;

    public function upload(UploadedFile $file, string $path = 'uploads', string $disk = 'public')
    {
        return $this->uploadSecurely($file, $path, $disk);
    }
}

test('secure upload stores a valid image with randomized filename', function () {
    Storage::fake('public');

    $uploader = new TestSecureUploader();
    // 1x1 PNG válido (evita requerir la extensión GD en el entorno local/CI)
    $pngBytes = base64_decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAOq3n6kAAAAASUVORK5CYII='
    );
    $file = UploadedFile::fake()->createWithContent('avatar.png', $pngBytes);

    $storedPath = $uploader->upload($file, 'avatars', 'public');

    expect($storedPath)->toBeString();
    expect($storedPath)->toStartWith('avatars/');
    expect(pathinfo($storedPath, PATHINFO_EXTENSION))->toBe('png');
    expect(pathinfo($storedPath, PATHINFO_FILENAME))->toMatch('/^[0-9a-f\-]{36}$/i');

    Storage::disk('public')->assertExists($storedPath);
});

test('secure upload rejects invalid image content (mime says image but content is not)', function () {
    Storage::fake('public');

    $uploader = new TestSecureUploader();
    $file = UploadedFile::fake()->create('not-really-an-image.jpg', 10, 'image/jpeg');

    $storedPath = $uploader->upload($file, 'avatars', 'public');

    expect($storedPath)->toBeFalse();
    expect(Storage::disk('public')->allFiles())->toBeEmpty();
});

test('secure upload stores non-image files without image validation', function () {
    Storage::fake('public');

    $uploader = new TestSecureUploader();
    $file = UploadedFile::fake()->create('doc.pdf', 25, 'application/pdf');

    $storedPath = $uploader->upload($file, 'docs', 'public');

    expect($storedPath)->toBeString();
    expect($storedPath)->toStartWith('docs/');

    Storage::disk('public')->assertExists($storedPath);
});
