import { ref, set, get, remove } from 'firebase/database';
import { db } from '../config/firebase';

const PATH = 'postImagePositions';

/**
 * Lưu vị trí insertAt của ảnh cho một post.
 * Gọi sau khi user drag ảnh đến vị trí mới hoặc sau khi tạo draft lần đầu.
 */
export async function saveImagePosition(postId: string, insertAt: number): Promise<void> {
    const nodeRef = ref(db, `${PATH}/${postId}`);
    await set(nodeRef, { insertAt });
}

/**
 * Đọc vị trí insertAt đã lưu cho một post.
 * Trả về null nếu chưa có record.
 */
export async function getImagePosition(postId: string): Promise<number | null> {
    const nodeRef = ref(db, `${PATH}/${postId}`);
    const snapshot = await get(nodeRef);
    if (!snapshot.exists()) return null;
    const data = snapshot.val() as { insertAt: number };
    return data.insertAt ?? null;
}

/**
 * Xóa record vị trí ảnh khi post bị archive hoặc content update không còn ảnh.
 */
export async function removeImagePosition(postId: string): Promise<void> {
    const nodeRef = ref(db, `${PATH}/${postId}`);
    await remove(nodeRef);
}