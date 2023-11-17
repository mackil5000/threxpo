import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { useEffect } from 'react';
import {
  AmbientLight,
  PerspectiveCamera,
  PointLight,
  Scene,
  SpotLight,
} from 'three';
import { Asset } from 'expo-asset';

export default function App() {
  let timeout;

  useEffect(() => {
    return () => clearTimeout(timeout);
  }, []);

  const onContextCreate = async (gl) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    const sceneColor = 0x000000;
    let eyeballs;
    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(sceneColor);

    const camera = new PerspectiveCamera(70, width / height, 0.01, 1000);
    camera.position.set(2, 2, 5);

    const scene = new Scene();

    const ambientLight = new AmbientLight(0x101010);
    scene.add(ambientLight);

    const pointLight = new PointLight(0xffffff, 1, 1000, 1);
    pointLight.position.set(0, 200, 200);
    scene.add(pointLight);

    const spotLight = new SpotLight(0xffffff, 0.5);
    spotLight.position.set(0, 500, 100);
    spotLight.lookAt(scene.position);
    scene.add(spotLight);

    // Load the model
    const asset = Asset.fromModule(require('./assets/male.obj'));
    await asset.downloadAsync();

    const loader = new OBJLoader();
    loader.load(asset.localUri, (object) => {
      object.scale.set(1, 1, 1); // Adjust scale if needed
      // object.rotateY(0.6);
      scene.add(object);
      camera.lookAt(object.position);
      object.traverse((child) => {
        if (child.isMesh && child.name === 'Group9192') {
          // name of the eyeballs group
          // Clone the material to create a unique instance
          const newMaterial = child.material.clone();
          child.material = newMaterial;
          eyeballs = child;
        }
      });
    });

    let n = 0;
    setInterval(() => {
      if (eyeballs) {
        if (n % 2 === 0) {
          eyeballs.material.color.set(0xff0000);
        } else {
          eyeballs.material.color.set(0x0080000);
        }
        n++;
      }
    }, 500);

    const render = () => {
      timeout = requestAnimationFrame(render);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  return <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />;
}
