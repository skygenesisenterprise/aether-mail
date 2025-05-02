export async function listFoldersForUser(userId: string) {
  // Dummy
  return ['Inbox', 'Sent', 'Drafts', 'Trash'];
}

export async function createFolderForUser(userId: string, name: string) {
  return { success: true, folder: name };
}

export async function deleteFolderForUser(userId: string, folderId: string) {
  return { success: true, folderId };
}
