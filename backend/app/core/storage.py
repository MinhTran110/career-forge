from minio import Minio
from app.core.config import settings


class StorageService:
    def __init__(self):
        self.client = Minio(
            endpoint=settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )
        self.bucket = settings.MINIO_BUCKET_NAME
        self._ensure_bucket()

    def _ensure_bucket(self):
        try:
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
        except Exception as e:
            # MinIO might not be up during local build
            print(f"Warning: Storage bucket initialization deferred: {e}")

    def upload_file(self, object_name: str, file_path: str, content_type: str = "application/pdf") -> str:
        self.client.fput_object(self.bucket, object_name, file_path, content_type=content_type)
        return f"{self.bucket}/{object_name}"

    def get_presigned_url(self, object_name: str, expires_seconds: int = 3600) -> str:
        return self.client.presigned_get_object(self.bucket, object_name, expires=expires_seconds)


storage = StorageService()
