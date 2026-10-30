import type { Crop } from '../lib/types';

export const CropName = ({ crop }: { crop: Crop }) => (
  <span className="crop-name">
    {crop.namePt}
    {crop.namePt !== crop.name && <small> {crop.name}</small>}
  </span>
);
