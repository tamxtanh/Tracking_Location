import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Alert, Image } from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Polyline,
  Region,
  LatLng,
} from "react-native-maps";
import * as Location from "expo-location";
import haversine from "haversine";

const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;

const Map: React.FC = () => {
  const [location, setLocation] = useState<Region>({
    latitude: 18.7934829,
    longitude: 98.9867401,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);
  const [distanceTravelled, setDistanceTravelled] = useState<number>(0);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startWatchingLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;

          if (routeCoordinates.length > 0) {
            const lastCoordinate =
              routeCoordinates[routeCoordinates.length - 1];
            const newDistance =
              haversine(lastCoordinate, { latitude, longitude }) || 0;
            setDistanceTravelled((prevDistance) => prevDistance + newDistance);
          }

          setLocation({
            latitude,
            longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          });
          setRouteCoordinates((prevCoords) => [
            ...prevCoords,
            { latitude, longitude },
          ]);
        }
      );
    };

    startWatchingLocation();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [routeCoordinates]);

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        region={location}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="You are here"
          description="This is your current location"
        >
          <Image
            source={require("../assets/images/delivery-bike.png")}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
        </Marker>
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#FF0000" // red color
          strokeWidth={4}
        />
      </MapView>
      <View style={styles.distanceContainer}>
        <Text style={styles.distanceText}>
          Distance Travelled: {distanceTravelled.toFixed(2)} km
        </Text>
      </View>
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  distanceContainer: {
    position: "absolute",
    bottom: 50,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  distanceText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
