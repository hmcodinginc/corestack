export const downloadDummyFile = (filename: string, content?: string) => {
  const fileContent = content || `This is a dummy file content for ${filename}.\nDownloaded at: ${new Date().toISOString()}`;
  const blob = new Blob([fileContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
