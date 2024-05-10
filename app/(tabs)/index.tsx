import {
  CameraType,
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { useState, useRef, LegacyRef } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";

export default function App() {
  const [facing, setFacing] = useState("back" as CameraType);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<LegacyRef<CameraView> | undefined>(null);
  const [video, setVideo] = useState(null);
  const [recording, setRecording] = useState(false);
  const [cameraText, setCameraText] = useState("Record Camera" as string);
  const [miropphonePermission, requestPermissionMic] =
    useMicrophonePermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }
  async function askForMicrophonePermissions() {
    try {
      if (Platform.OS !== "web") {
        //const { status } = await Camera.getMicrophonePermissionsAsync()
        console.log("miropphonePermission", miropphonePermission);
        let finalStatus = miropphonePermission?.status;
        if (finalStatus !== "granted") {
          //alert('We need microphone  permissions for you to take videos')
          //const { status } = await Camera.requestMicrophonePermissionsAsync()
          const { status } = await requestPermissionMic();
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          return false;
        }
        return true;
      }
    } catch (e) {
      console.log("Error in asking for microphone permissions", e);
    }
  }

  const record = async () => {
    if (cameraRef) {
      let localVid;
      try {
        if (!recording) {
          setRecording(true);
          setCameraText("Stop Recording");
          console.log("Platform.OS ", Platform.OS === "android");

          localVid = await cameraRef.current.recordAsync({
            maxDuration: Platform.OS === "android" ? 5000 : 5,
            //quality: Platform.OS === 'android' ? Camera.Constants.VideoQuality['480p'] : Camera.Constants.VideoQuality['480p'],
            quality: "480p",
            //quality: "4:3",
            //mirror: type === 'front' ? true : false,
          });
          setVideo(localVid);
          console.log("Video recorded", localVid);

          setRecording(false);
        } else {
          setCameraText("Record Camera");
          setRecording(false);
          if (localVid) {
            setVideo(localVid.uri);
          }
          cameraRef?.current?.stopRecording();
        }
      } catch (e) {
        console.log("Error recording video", e);
      }
    }
  };

  const snapPhoto = async () => {
    try {
      const image = await cameraRef.current.takePictureAsync({
        quality: 0,
      });
      console.log("image uri", image);
    } catch (error) {
      console.log("error snaping photo", error);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        ref={cameraRef}
        facing={facing}
        mode="video"
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={record}>
            <Text style={styles.text}>{cameraText}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={askForMicrophonePermissions}
          >
            <Text style={styles.text}>Request Mic Perm</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 30,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  button2: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
    marginTop: 10,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
