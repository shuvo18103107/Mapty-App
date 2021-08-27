'use strict';

class Workout {
    date = new Date();
    //each object should have a unique id
    id = (Date.now() + '').slice(-10);
    //data that common on both cycling and running
    constructor(coords, distance, duration) {
        this.coords = coords; // [lat,lng]
        this.distance = distance; //in km
        this.duration = duration; //in minute
    }
}
class Running extends Workout {
    type = 'running';
    constructor(coord, distance, duration, cadence) {
        super(coord, distance, duration);
        this.cadence = cadence;
        this.calcPace();
    }
    calcPace() {
        //min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}
class Cycling extends Workout {
    type = 'cycling';
    constructor(coord, distance, duration, elevationGain) {
        super(coord, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
    }
    calcSpeed() {
        //km/h
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

// const run1 = new Running([39, -12], 5.2, 24, 173);
// const cycling1 = new Cycling([39, -12], 27, 95, 573);

// console.log(run1);
// console.log(cycling1);

/////////////////////////////////////////////////////////////
//Application Architecture
const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

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
    //here we want to store workout objects
    #workouts = [];

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
                this._loadMap.bind(this), //not method call function call so bind it so that it can be a function call, function call ethis undefined
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
        // console.log(`https://www.google.com/maps/@${latitude},${longitude}`); //get my current cooordinates
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
        let workout;
        //take arbitary inputs means the argument length i dont know and it returns a array
        const validInputs = (...inputs) =>
            inputs.every(inp => Number.isFinite(inp)); //every returns true if all the eleemnts is true
        const allPositive = (...inputs) => inputs.every(inp => inp > 0);
        //*get data from the form
        const type = inputType.value; //we get string type value so converting to number using + operator
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng;
        if (type === 'running') {
            const cadence = +inputCadence.value;
            //check if data is valid
            //using guard class , means check opposite what we are interesting on if that opposite is true then return the function immediately
            if (
                //function false return korlei execute korbe
                //&& use korle false return korleow if jehutu false hole execute korbe kintu && check korbe all false value kina  so better use or
                !validInputs(distance, duration, cadence) ||
                !allPositive(distance, duration, cadence)
            ) {
                return alert('Inputs have to be positive number!');
            }
            //*if workout running , create running object

            workout = new Running([lat, lng], distance, duration, cadence); //object made
        }

        if (type === 'cycling') {
            const elevation = +inputElevation.value;
            if (
                !validInputs(distance, duration, elevation) ||
                !allPositive(distance, duration) //cg elevation can be begative
            ) {
                return alert('Inputs have to be positive number!');
            }
            //*if workout cycling , create cycling object
            workout = new Cycling([lat, lng], distance, duration, elevation); //object made
        }

        //push the running or cycling object to the workout array
        this.#workouts.push(workout);
        //render workout on map as marker
        this._renderworkoutMarker(workout);
        //render workout on list

        //clear input fields + hide forms
        inputDistance.value =
            inputCadence.value =
            inputDuration.value =
            inputElevation.value =
            '';
    }
    _renderworkoutMarker(workout) {
        //get the workout object to set the data into the map from the object

        L.marker(workout.coords)
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
                    className: `${workout.type}-popup`,
                })
            )
            .setPopupContent('workout')
            .openPopup();
        // Render workout on list

        //Hide the form and clear input fields
    }
}

const app = new App(); //when object create from a class constructor function is called each time
// console.log(app);
