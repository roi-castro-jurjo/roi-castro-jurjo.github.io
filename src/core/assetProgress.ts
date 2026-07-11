type AssetProgressHandler = (loadedAssetCount: number, totalAssetCount: number) => void

const progressHandlers = new Set<AssetProgressHandler>()

export function onAssetLoadProgress(handleProgress: AssetProgressHandler): () => void {
  progressHandlers.add(handleProgress)
  return () => progressHandlers.delete(handleProgress)
}

export function reportAssetLoadProgress(
  loadedAssetCount: number,
  totalAssetCount: number,
): void {
  progressHandlers.forEach((handleProgress) =>
    handleProgress(loadedAssetCount, totalAssetCount),
  )
}
