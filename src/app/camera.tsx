import { CameraView, useCameraPermissions, } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState, } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { inferImage } from "../services/inference";



export default function CameraScreen() {

  const [preview, setPreview] = useState<string | null>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] =
    useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {

    return (

      <View style={styles.permissionContainer}>

        <Text style={styles.message}>
          Precisamos da sua permissão para acessar a câmera.
        </Text>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >

          <Text style={styles.permissionButtonText}>
            Permitir câmera
          </Text>

        </TouchableOpacity>

      </View>
    );
  }

  async function takePicture() {

    if (!cameraRef.current) return;

    try {

      const photo = await cameraRef.current.takePictureAsync();
      console.log(photo.uri);
      if (!photo) return;

      setPreview(photo.uri);

      console.log("Foto capturada:");
      console.log(photo);

      const result = await inferImage(photo.uri);

      router.push({
        pathname: "/diagnosis",
        params: {
          diagnosis: JSON.stringify(result),
        },
      });

      console.log("Resposta da API:");
      console.log(result);

    } catch (error) {

      console.error("Erro:");
      console.error(error);

    }

  }

  async function pickImage() {

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert('Precisamos da permissão para acessar suas fotos.');
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({

        mediaTypes: ['images'],
        allowsEditing: true,

        quality: 0.7,
      });
    console.log('RESULTADO:', result);

    if (!result.canceled) {

      try {

        const image = result.assets[0];



        console.log("Imagem escolhida:");
        console.log(image);

        const diagnosis = await inferImage(image.uri);

        router.push({
          pathname: "/diagnosis",
          params: {
            diagnosis: JSON.stringify(diagnosis),
          },
        });

        console.log("Resposta da API:");
        console.log(diagnosis);

      } catch (error) {

        console.error(error);

      }

    } else {

      console.log("Seleção cancelada.");

    }

  }

  return (

    <View style={styles.container}>

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      />

      <View style={styles.overlay}>

        <View style={styles.galleryButtonContainer}>

          <TouchableOpacity
            style={styles.galleryButton}
            onPress={pickImage}
          >

            <Text style={styles.galleryButtonText}>
              Galeria
            </Text>

          </TouchableOpacity>

          {preview && (
            <Image
              source={{ uri: preview }}
              style={{
                width: 250,
                height: 250,
                position: "absolute",
                top: 40,
                right: 20,
              }}
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.captureButton}
          onPress={takePicture}
        />

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  camera: {
    flex: 1,
  },

  overlay: {

    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    justifyContent: 'flex-end',
    alignItems: 'center',

    paddingBottom: 48,
  },

  captureButton: {
    width: 84,
    height: 84,

    borderRadius: 999,

    backgroundColor: '#FFFFFF',

    borderWidth: 6,
    borderColor: '#D9D9D9',
  },

  flipButton: {
    position: 'absolute',

    top: 80,
    right: 32,

    backgroundColor: 'rgba(0,0,0,0.5)',

    paddingHorizontal: 16,
    paddingVertical: 10,

    borderRadius: 12,
  },

  text: {
    color: '#FFFFFF',
    fontSize: 16,
  },

  permissionContainer: {
    flex: 1,

    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 24,
  },

  message: {
    textAlign: 'center',

    fontSize: 18,

    marginBottom: 24,
  },

  permissionButton: {
    backgroundColor: '#2C473E',

    paddingHorizontal: 24,
    paddingVertical: 14,

    borderRadius: 16,
  },

  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  galleryButton: {

    marginTop: 20,

    backgroundColor: 'rgba(0,0,0,0.6)',

    paddingHorizontal: 20,
    paddingVertical: 12,

    borderRadius: 14,
  },

  galleryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  galleryButtonContainer: {

    position: 'absolute',
    top: 40,
    left: 32,
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

});