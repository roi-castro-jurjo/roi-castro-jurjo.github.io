import * as THREE from 'three'
import { reportAssetLoadProgress } from './assetProgress'

class AssetLoader {
  readonly loadingManager = new THREE.LoadingManager()
  readonly textureLoader = new THREE.TextureLoader(this.loadingManager)

  constructor() {
    this.loadingManager.onProgress = (_assetUrl, loadedAssetCount, totalAssetCount) =>
      reportAssetLoadProgress(loadedAssetCount, totalAssetCount)
  }
}

export const sharedAssetLoader = new AssetLoader()
