'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//geolocation api
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        //1st callback is success when browser get the coordinate,2nd cllback is the error confirmation
        //success call back
        function (position) {
            console.log(position);
            const { latitude } = position.coords;
            const { longitude } = position.coords;
            // console.log(latitude, longitude);
            console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
            //leaflet API implemtation code
            //here map is the id name where we want to show our map
            const coord = [latitude, longitude];
            const map = L.map('map').setView(coord, 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            L.marker(coord)
                .addTo(map)
                .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
                .openPopup();
        },

        //error call back
        function () {
            alert('Could not get your position');
        }
    );
}
