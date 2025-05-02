export async function sendMailForUser(userId: string, to: string, subject: string, body: string) {
  return { success: true, to, subject, body };
}

export async function getInboxForUser(userId: string) {
  return [{ id: 1, from: 'alice@example.com', subject: 'Hi', read: false }];
}

export async function deleteMailForUser(userId: string, emailId: string) {
  return { success: true, emailId };
}
