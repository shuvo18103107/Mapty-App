'use strict';

class Workout {
    //parent class so other class extend korle er property oi class eow thakbe
    date = new Date();
    //each object should have a unique id
    id = (Date.now() + '').slice(-10);
    clicks = 0;
    //data that common on both cycling and running
    constructor(coords, distance, duration) {
        this.coords = coords; // [lat,lng]
        this.distance = distance; //in km
        this.duration = duration; //in minute
    }
    _setDescription() {
        //prettier-ignore
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
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]
            } ${this.date.getDate()}`;
    }
    click() {
        this.clicks++;
    }
}

class Running extends Workout {
    type = 'running';
    constructor(coord, distance, duration, cadence) {
        super(coord, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
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
        this._setDescription();
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

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const clearBtn = document.querySelector('.btn__clearAll');
const btnPositive = document.querySelector('.btn--positive');
const btnNegative = document.querySelector('.btn--negative');
const alertMessage = document.querySelector('.alert--deletion');

class App {
    //private property that belong all instances
    #map;
    #mapEvent;
    #mapZoomLevel = 13;
    //here we want to store workout objects
    #workouts = [];

    constructor() {
        //Get user Position
        this._getPosition();
        //Get Data from local storage
        this._getLocalStorage();
        //Attach EventListner
        //form submit eventlistner
        form.addEventListener('submit', this._newWorkout.bind(this)); //eventhamdler e this dom element re point kore jetai add thake ekhane form

        inputType.addEventListener('change', this._toogleElevationField); //no this , so no need to call bind cg here this refer the dom element and we need this to change option
        //still workout list is not created so we have to do event delegation to manahe event handler
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
        //clear all workout
        clearBtn.addEventListener('click', this._deleteAll.bind(this));
        const deleteWorkout = document.querySelectorAll('.delete');
        console.log(deleteWorkout);
        deleteWorkout.forEach(delItem => {
            delItem.addEventListener('click', this._deleteItem.bind(this));
        });
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
        // console.log(position);
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        // console.log(latitude, longitude);
        // console.log(`https://www.google.com/maps/@${latitude},${longitude}`); //get my current cooordinates
        //leaflet API implemtation code
        //here map is the id name where we want to show our map
        const coord = [latitude, longitude];
        this.#map = L.map('map').setView(coord, this.#mapZoomLevel);
        // console.log(this.#map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.#map);
        //render marker from the localstorage
        this.#workouts.forEach(work => {
            this._renderworkoutMarker(work);
        });
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
    _hideForm() {
        // Empty inputs
        inputDistance.value =
            inputDuration.value =
            inputCadence.value =
            inputElevation.value =
            '';

        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => (form.style.display = 'grid'), 1000); //bootstrap er karone prb hocee grid important set korte
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
        this._renderWorkout(workout);

        //clear input fields + hide forms
        this._hideForm();
        //set localstorage to all workouts
        this._setLocalStorage();
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
            .setPopupContent(
                `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
            )
            .openPopup();
        // Render workout on list

        //Hide the form and clear input fields
    }
    _renderWorkout(workout) {
        let html = ` <li class="workout workout--${workout.type}" data-id="${workout.id
            }">
        <h2 class="workout__title">${workout.description
            } <i class="fa fa-pencil edit"></i><i class="fa fa-trash-o delete"></i></h2>
        


        <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
        </div>`;
        if (workout.type === 'running') {
            html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
        </div> </li>`;
        }
        if (workout.type === 'cycling') {
            html += ` <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
        </div></li>`;
        }
        form.insertAdjacentHTML('afterend', html);
    }
    _moveToPopup(e) {
        const workoutEl = e.target.closest('.workout');
        // console.log(workoutEl);
        if (!workoutEl) return; // we can also do this like if(workoutEl) then do some work
        //get the clicked workout object from the array of objects in workouts array
        const workout = this.#workouts.find(
            work => work.id === workoutEl.dataset.id
        );
        // console.log(workout);
        //take the current object and  grabe the coords ans set it on map
        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1,
            },
        }); //1st coords ,2nd zoom level, 3rd object of option
        //using the public interface click
        // workout.click(); //localstorage theke data get kore parent class er function call korte parbe na cg tokn prototype chain break kore
    }

    _setLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    }
    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('workouts'));
        // console.log(data);
        if (!data) return;

        this.#workouts = data;
        this.#workouts.forEach(work => {
            this._renderWorkout(work);
        });
    }
    // Deletes all workouts
    _deleteAll() {
        if (this.#workouts.length === 0) return;
        this._renderAlert();
        let paragraph = alertMessage.children;
        paragraph[0].innerText = `Are you sure you want to delete all your workouts?`;

        btnPositive.addEventListener(`click`, () => {
            this._reset();
        });
        // If btn-Negative, remove the alert and add back the Clear All btn.
        btnNegative.addEventListener('click', () => {
            alertMessage.classList.remove('alert--deletion--active');
            clearBtn.style.display = 'unset';
        });
    }

    _reset() {
        localStorage.removeItem('workouts');
        location.reload();
    }
    _renderAlert() {
        // Add alert message and remove the clear all button
        alertMessage.classList.add('alert--deletion--active');
        clearBtn.style.display = 'none';
    }
    _deleteItem(e) {
        let target = e.target.closest('.workout');
        // console.log(target);
        let workOutArray = this.#workouts;
        console.log(workOutArray);
        this._renderAlert();

        alert('hi vai');

        btnPositive.addEventListener('click', function () {
            workOutArray.forEach((item, i) => {
                item.id === target.dataset.id;

                workOutArray.splice(i, 1);
                console.log(workOutArray);
                localStorage.setItem('workouts', JSON.stringify(workOutArray));
                location.reload();
            });
        });
        btnNegative.addEventListener('click', () => {
            alertMessage.classList.remove('alert--deletion--active');
            clearBtn.style.display = 'unset';
        });
    }
}
const app = new App(); //when object create from a class constructor function is called each time
// console.log(app);
