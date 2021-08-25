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
let map, mapEvent;
//geolocation api and leaflet api implementation
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
            map = L.map('map').setView(coord, 13);
            // console.log(map);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);



            //displaying a map marker
            //on method is not come from js , it came from leaflet api
            //here we use on method basically to add an eventlistner
            map.on('click', function (mapE) {
                //  console.log(mapE); //this event gives us a object inside it we get lat and long now add marker via this

                mapEvent = mapE;
                //show the workout form

                form.classList.remove('hidden')
                inputDistance.focus();


            })
        },

        //error call back
        function () {
            alert('Could not get your position');
        }
    );
}

//form submit eventlistner
form.addEventListener('submit', function (e) {
    e.preventDefault();
    //clear input fields 
    inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';
    //display marker 
    // adding marker 
    const { lat, lng } = mapEvent.latlng
    L.marker([lat, lng])
        .addTo(map)
        .bindPopup(L.popup({
            //define size of the pop up
            maxWidth: 250,
            minWidth: 100,
            //auto close  when another place on map we click so make it false
            autoClose: false,
            //when click on cross on the pop up it disappera make it false
            closeOnClick: false,
            //we can assign any css classname on the popup
            className: 'running-popup'
        }))
        .setPopupContent('welcome shuvo')
        .openPopup();
})

inputType.addEventListener('change', function () {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden')

})