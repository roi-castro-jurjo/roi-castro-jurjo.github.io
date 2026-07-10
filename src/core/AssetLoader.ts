import * as THREE from 'three'

class AssetLoader {
  readonly loadingManager = new THREE.LoadingManager()
  readonly textureLoader = new THREE.TextureLoader(this.loadingManager)

  onProgress(
    handleProgress: (loadedAssetCount: number, totalAssetCount: number) => void,
  ): void {
    this.loadingManager.onProgress = (_assetUrl, loadedAssetCount, totalAssetCount) =>
      handleProgress(loadedAssetCount, totalAssetCount)
  }

  onAllAssetsLoaded(handleAllAssetsLoaded: () => void): void {
    this.loadingManager.onLoad = handleAllAssetsLoaded
  }
}

export const sharedAssetLoader = new AssetLoader()
