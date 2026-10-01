export type UploadTarget = { url: string; headers: Record<string, string> };
export type StoredObject = { size: number; contentType: string };

export interface StorageDriver {
    createUploadTarget(key: string, contentType: string, size: number): Promise<UploadTarget>;
    head(key: string): Promise<StoredObject | null>;
    remove(key: string): Promise<void>;
    publicUrl(key: string): string;
}