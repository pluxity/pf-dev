export interface CameraPosition {
  longitude: number;
  latitude: number;
  height: number;
  heading: number;
  pitch: number;
}

interface CameraOptions {
  longitude: number;
  latitude: number;
  height?: number;
  heading?: number;
  pitch?: number;
}

export interface FlyToOptions extends CameraOptions {
  duration?: number;
}

export interface LookAtOptions extends CameraOptions {
  distance?: number;
  duration?: number;
}

export type SetViewOptions = CameraOptions;
