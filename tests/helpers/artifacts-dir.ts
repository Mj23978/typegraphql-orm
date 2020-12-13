import path from "path";

export default function generateArtifactsDirPath(folderPrefix: string): string {
  const randomNumber = Math.random().toFixed(12).slice(2);
  return path.join(
    __dirname,
    "../artifacts",
    `${folderPrefix}-${randomNumber}`,
  );
}
