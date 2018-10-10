import React from "react";
import {StyleSheet, Text, View} from "react-native";
import {MapView} from "expo";
import Geocoder from 'react-native-geocoding';
import { createStackNavigator, StackActions, NavigationActions } from 'react-navigation';

class App extends React.Component {

    state = {
        marker: null,
        locality: null,
        city: null
    };

    constructor(props){
        super(props);
        Geocoder.init('AIzaSyAWOjSnB5Zz3iNO0W21STINGdkBuogGGDk');
    }

    addMarker(e){

        const coordinate = e.nativeEvent.coordinate;

        let locality = null;
        let city = null;

        Geocoder.from(coordinate.latitude, coordinate.longitude)
            .then(json => {
                for (let i = 0; i < json.results.length; i++) {
                    if (json.results[i]['types'][0] == 'locality') {
                        locality = json.results[i];

                        for(let l = 0; l < locality['address_components'].length; l++) {
                            if (locality['address_components'][l]['types'][0] == 'locality') {
                                city = locality['address_components'][l]['long_name'];
                                break;
                            }
                        }
                        break;

                    }
                }

                this.setState({
                    marker: {
                        coordinate: coordinate,
                        title: city,
                        description: locality.long_name
                    },
                    locality: locality,
                    city: city
                });

            })
            .catch(error => console.warn(error));


    }

    /**
     *
     * @param lat
     * @param lon
     * @param distance
     * @returns {{latitude: *, longitude: *, latitudeDelta: number, longitudeDelta: number}}
     */
    getRegion(lat, lon, distance) {
        distance = distance/2;
        const circumference = 40075;
        const oneDegreeOfLatitudeInMeters = 111.32 * 1000;
        const angularDistance = distance/circumference;

        const latitudeDelta = distance / oneDegreeOfLatitudeInMeters;
        const longitudeDelta = Math.abs(Math.atan2(
            Math.sin(angularDistance)*Math.cos(lat),
            Math.cos(angularDistance) - Math.sin(lat) * Math.sin(lat)));

        return result = {
            latitude: lat,
            longitude: lon,
            latitudeDelta,
            longitudeDelta,
        }
    }

    render() {

        let marker;

        if (this.state.marker) {

            marker = <MapView.Marker
                            coordinate={this.state.marker.coordinate}
                            title={this.state.marker.title}
                            description={this.state.marker.description}
                            onPress={() => {
                                    this.props.navigation.navigate('Weather', {
                                        localityLongName: this.state.locality.long_name,
                                        city: this.state.city,
                                    });
                                }
                            }
                        />
        }
        return (
            <View style={styles.container}>
                <MapView
                    style={{alignSelf: 'stretch', height: '100%'}}
                    initialRegion={this.getRegion(50.45466, 30.5238, 100000)}
                    onLongPress={this.addMarker.bind(this)}
                >
                    {marker}

                </MapView>
            </View>
        );
    }
}

class Weather extends React.Component {

    appid = '3068aa669963cf174759890deef2616b';
    state = {
        t: '',
    };

    constructor(props){
        super(props);
    }


    componentDidMount(){
        const { navigation } = this.props;
        const localityLongName = navigation.getParam('localityLongName', 'NO-ID');
        const city = navigation.getParam('city', 'NO-ID');
        fetch('http://api.openweathermap.org/data/2.5/weather?q=Kiev&appid=3068aa669963cf174759890deef2616b', {
            method: 'GET'
        }).then(response => {
            let contentType = response.headers.get("content-type");
            if(contentType && contentType.includes("application/json")) {
                return response.json();
            }
            throw new TypeError("Oops, we haven't got JSON!")
        }).then(data => {
            console.log(data);
            this.setState({
                t: (data.main.temp - 273.15).toFixed(2),
                w: data.weather[0].description,
                localityLongName: localityLongName,
                city: city
            });

        });
    }

    render() {
        const { navigation } = this.props;

        const localityLongName = navigation.getParam('localityLongName', 'NO-DATA');
        const city = navigation.getParam('city', 'NO-DATA');

        console.log(this.state);

        return (
            <View style={styles.container}>
                <Text>City: {city}</Text>
                <Text>Temp: {this.state.t} C°</Text>
                <Text>Description: {this.state.w}</Text>
            </View>
        );
    }
}

export default createStackNavigator({
    Map: {
        screen: App
    },
    Weather: {
        screen: Weather
    }
}, {
    initialRouteName: 'Map',
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
