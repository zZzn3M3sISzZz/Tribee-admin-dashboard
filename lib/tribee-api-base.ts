export function tribeeApiBase(): string {
  return (
    process.env.TRIBEE_API_URL ??
    process.env.NEXT_PUBLIC_TRIBEE_API_URL ??
    "https://api.enshaproductions.com"
  ).replace(/\/$/, "");
}
