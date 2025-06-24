import ImagesContainer from "@/components/ImagesContainer";

import { getAllImagesFromUploadThing } from "@/lib/images";

const HomePage = async () => {
  const images = await getAllImagesFromUploadThing();
  return <ImagesContainer images={images} />;
};

export default HomePage;
