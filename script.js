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

class App {
    //private property that belong all instances
    #map;
    #mapEvent;
    constructor() {
        this._getPosition();
        //form submit eventlistner
        form.addEventListener('submit', this._newWorkout.bind(this)); //eventhamdler e this dom element re point kore jetai add thake ekhane form

        inputType.addEventListener('change', this._toogleElevationField); //no this , so no need to call bind cg here this refer the dom element and we need this to change option
    }

    //protected methods
    _getPosition() {
        //geolocation api and leaflet api implementation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                //1st callback is success when browser get the coordinate,2nd cllback is the error confirmation
                //success call back, it is a function call noth method call, this is called by getcurrentposition not object method call, we know in reg func call this is undefined
                // this._loadMap, //, it will e undefined cg js call this callback function and pass position argument, so method call is not work here , solution is we can bind this method and we know bind return a regular function
                this._loadMap.bind(this),
                //error call back
                function () {
                    alert('Could not get your position');
                }
            );
        }
    }
    _loadMap(position) {
        console.log(position);
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        // console.log(latitude, longitude);
        console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
        //leaflet API implemtation code
        //here map is the id name where we want to show our map
        const coord = [latitude, longitude];
        this.#map = L.map('map').setView(coord, 13);
        // console.log(this.#map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.#map);

        //displaying a map marker
        //on method is not come from js , it came from leaflet api
        //here we use on method basically to add an eventlistner
        this.#map.on(
            'click',
            this._showForm.bind(this)
            //  console.log(mapE); //this event gives us a object inside it we get lat and long now add marker via this
        );
    }
    _showForm(mapE) {
        this.#mapEvent = mapE;
        //show the workout form

        form.classList.remove('hidden');
        inputDistance.focus();
    }
    //toogle e object er kono property ba method refer er kaj nai so this diye object indicate lagtece na ekhane tai bind kore object specify korar drkr nai
    _toogleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden'); //cadence means step/minute
    }
    _newWorkout(e) {
        e.preventDefault();
        //clear input fields
        inputDistance.value =
            inputCadence.value =
            inputDuration.value =
            inputElevation.value =
            '';
        //display marker
        // adding marker
        const { lat, lng } = this.#mapEvent.latlng;
        L.marker([lat, lng])
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    //define size of the pop up
                    maxWidth: 250,
                    minWidth: 100,
                    //auto close  when another place on map we click so make it false
                    autoClose: false,
                    //when click on cross on the pop up it disappera make it false
                    closeOnClick: false,
                    //we can assign any css classname on the popup
                    className: 'running-popup',
                })
            )
            .setPopupContent('welcome shuvo')
            .openPopup();
    }
}

const app = new App(); //when object create from a class constructor function is called each time
console.log(app);
