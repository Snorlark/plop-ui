# The star count refreshes on a GitHub webhook

The header's star count came from the GitHub API, cached for an hour per page. Each page refreshed only when someone visited it after that hour, so a quiet page could show a count that was hours old.

The fetch is now tagged `stars`. A GitHub webhook for Stars events posts to `/api/github`, which checks the `X-Hub-Signature-256` HMAC against `GITHUB_WEBHOOK_SECRET` and calls `revalidateTag("stars")`. Every page then gets the new count on its next visit. The hourly refresh stays as a fallback if a delivery is missed.

There is no queue: a burst of stars only marks the same tag stale again, and the count is fetched once and shared by every page, so it stays well under GitHub's unauthenticated limit of 60 requests an hour.
