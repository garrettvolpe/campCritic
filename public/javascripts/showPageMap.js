mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map', 
style: 'mapbox://styles/mapbox/streets-v12', 
center: campground.geometry.coordinates,
zoom: 10 ,// starting zoom
});


new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(campground.geometry.coordinates)
        .setHTML(`<h3>${campground.title}</h3><p>${campground.location}</p>`)
    )
    .addTo(map)

    map.addControl(new mapboxgl.NavigationControl());
