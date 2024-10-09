// components/main.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  Linking,
  StyleSheet,
} from "react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";

const LocationLogger: React.FC = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<string>(""); // State for user input latitude
  const [longitude, setLongitude] = useState<string>(""); // State for user input longitude

  const getLocation = async () => {
    try {
      // Ask for permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      // Get the current location
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    } catch (error) {
      setErrorMsg("This is in error");
    }
  };

  const openInMaps = () => {
    if (latitude && longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      Linking.openURL(url);
    } else {
      setErrorMsg("Please enter both latitude and longitude");
    }
  };

  const router = useRouter();

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    setLatitude(location?.coords.latitude?.toString() || "");
    setLongitude(location?.coords.longitude?.toString() || "");
  }, [location]);

  return (
    <View style={styles.container}>
      <Button title="Get Current Location" onPress={getLocation} />
      {errorMsg ? (
        <Text>{errorMsg}</Text>
      ) : location ? (
        <>
          <Text>Latitude: {location.coords.latitude}</Text>
          <Text>Longitude: {location.coords.longitude}</Text>
        </>
      ) : (
        <Text>Fetching location...</Text>
      )}

      {/* Inputs for latitude and longitude */}
      <TextInput
        style={styles.input}
        placeholder="Enter Latitude"
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Longitude"
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numeric"
      />

      {/* Button to open Google Maps */}
      <Button title="Open Maps" onPress={openInMaps} />

      <Button
        title="View Maps"
        onPress={() => {
          router.push("/map");
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default LocationLogger;
