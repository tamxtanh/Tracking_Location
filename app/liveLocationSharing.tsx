// App.tsx
import React, { useEffect, useState } from "react";
import { StyleSheet, Image, View, Alert, Text } from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Polyline,
  Region,
  LatLng,
} from "react-native-maps";
import * as Location from "expo-location";
import { database } from "../firebaseConfig";
import { ref, set, onValue, push, update } from "firebase/database";
import { useLocalSearchParams } from "expo-router";
import haversine from "haversine";

// Type for location data
interface LocationData {
  latitude: number;
  longitude: number;
}

// TypeScript interface for user location data
interface UserLocation {
  location: LocationData; // Assuming LocationData is defined as { latitude: number; longitude: number; }
  routeCoordinates: LatLng[]; // Array of coordinates for the user's route
}

const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;

const App: React.FC = () => {
  const localParams = useLocalSearchParams();

  const [location, setLocation] = useState<Region>({
    latitude: 10.84952,
    longitude: 106.799865,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  const [otherUserLocations, setOtherUserLocations] = useState<{
    [userId: string]: UserLocation;
  }>({});

  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    if (typeof localParams?.userId === "string") {
      setUserId(localParams.userId);
    }
  }, [localParams]);

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
          timeInterval: 5000,
        },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;

          setLocation({
            latitude,
            longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          });

          updateUserLocation(userId, latitude, longitude);
        }
      );
    };

    startWatchingLocation();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [userId]);

  // Function to update user location in Firebase
  const updateUserLocation = (
    userId: string,
    latitude: number,
    longitude: number
  ) => {
    // Check if userId is undefined
    if (typeof userId !== "string" || userId.trim() === "") {
      // console.log("User ID is undefined, cannot update location.");
      return; // Exit the function if userId is undefined
    }

    console.log("called update");

    // Reference for user's current location
    const userLocationRef = ref(database, `userLocation/${userId}/location`);

    // Reference for RouteCoordinates
    const userRouteRef = ref(
      database,
      `userLocation/${userId}/routeCoordinates`
    );

    // Update the current location
    set(userLocationRef, { latitude, longitude });

    // Push the new coordinate to RouteCoordinates array
    push(userRouteRef, { latitude, longitude });
  };

  // Function to listen for other users' location updates
  const listenToOtherUsers = () => {
    const usersRef = ref(database, "userLocation");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      // console.log(data);
      if (data) {
        const formattedLocations: { [userId: string]: UserLocation } = {};
        Object.keys(data).forEach((userIdTempt) => {
          const userLocationData = data[userIdTempt];
          if (userLocationData) {
            const routeCoordinatesArray: LatLng[] = Object.values(
              userLocationData.routeCoordinates || {}
            );

            // Create a formatted user location object
            formattedLocations[userIdTempt] = {
              location: userLocationData.location,
              routeCoordinates: routeCoordinatesArray,
            };

            if (typeof userId !== "string" || userId.trim() === "") {
              console.log("userId", userId);
              console.log("userIdTempt", userIdTempt);
              if (userId !== userIdTempt) {
                const { latitude, longitude } = userLocationData.location;
                setLocation({
                  latitude,
                  longitude,
                  latitudeDelta: LATITUDE_DELTA,
                  longitudeDelta: LONGITUDE_DELTA,
                });
              }
            }
          }
        });
        setOtherUserLocations(formattedLocations);
      }
    });

    console.log("listen to be called");
  };

  // Setup listener for other users' locations only once
  useEffect(() => {
    listenToOtherUsers();
  }, []); // Empty dependency array ensures this only runs once

  // Function to get the appropriate image source based on userId
  const getImageSource = (userId: string) => {
    switch (userId) {
      case "userId1":
        return require("../assets/images/person1.png");
      case "userId2":
        return require("../assets/images/person2.png");
      default:
        return require("../assets/images/delivery-bike.png");
    }
  };

  return (
    <View style={styles.container}>
      <MapView provider={PROVIDER_GOOGLE} style={styles.map} region={location}>
        {Object.keys(otherUserLocations).map((userId) => {
          const userLocation = otherUserLocations[userId];
          const userRouteCoordinates: LatLng[] =
            userLocation.routeCoordinates || []; // Access route coordinates for the user

          return (
            <React.Fragment key={userId}>
              <Marker
                coordinate={userLocation.location}
                title={`${userId}`}
                description={`This is the current location of ${userId}`}
              >
                <Image
                  source={getImageSource(userId)}
                  style={{ width: 40, height: 40 }}
                  resizeMode="contain"
                />
              </Marker>
              <Polyline
                coordinates={userRouteCoordinates} // Use user's route coordinates
                strokeColor={userId === "userId1" ? "#0000FF" : "#FFC0CB"} // Set color based on userId
                strokeWidth={4}
              />
            </React.Fragment>
          );
        })}
      </MapView>
      {/* <View style={styles.distanceContainer}>
        <Text style={styles.distanceText}>
          Distance Travelled: {distanceTravelled.toFixed(2)} km
        </Text>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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

export default App;
