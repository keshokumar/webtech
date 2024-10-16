var app = angular.module('eventApp', []);

app.factory('EventFactory', function($http) {
    const apiUrl = '/api/events';

    return {
        getEvents: function() {
            return $http.get(apiUrl);
        },
        addEvent: function(eventData) {
            return $http.post(apiUrl, eventData);
        },
        updateEvent: function(event) {
            return $http.put(`${apiUrl}/${event._id}`, event);
        },
        deleteEvent: function(eventId) {
            return $http.delete(`${apiUrl}/${eventId}`);
        }
    };
});

app.service('EventService', function(EventFactory) {
    this.fetchEvents = function() {
        return EventFactory.getEvents();
    };

    this.createEvent = function(eventData) {
        return EventFactory.addEvent(eventData);
    };

    this.editEvent = function(event) {
        return EventFactory.updateEvent(event);
    };

    this.removeEvent = function(eventId) {
        return EventFactory.deleteEvent(eventId);
    };
});

app.controller('EventController', function($scope, EventService) {
    $scope.events = [];
    $scope.newEvent = {};
    $scope.editingEvent = null; // To hold the event being edited
    $scope.currency = 'USD';

    // Fetch events on controller initialization
    EventService.fetchEvents().then(function(response) {
        $scope.events = response.data;
    }).catch(function(error) {
        console.error("Error fetching events:", error);
    });

    // Function to add a new event
    $scope.addEvent = function() {
        EventService.createEvent($scope.newEvent).then(function(response) {
            $scope.events.push(response.data);
            $scope.newEvent = {}; // Reset newEvent object after adding
        }).catch(function(error) {
            console.error("Error adding event:", error);
        });
    };

    // Function to prepare an event for editing
    $scope.updateEvent = function(event) {
        $scope.editingEvent = angular.copy(event); // Create a copy for editing
    };

    // Function to update an existing event
    $scope.updateExistingEvent = function(event) {
        EventService.editEvent(event).then(function(response) {
            const index = $scope.events.findIndex(e => e._id === response.data._id);
            if (index !== -1) {
                $scope.events[index] = response.data; // Update the event in the list
            }
            $scope.editingEvent = null; // Reset editing event
        }).catch(function(error) {
            console.error("Error updating event:", error);
        });
    };

    // Function to cancel editing
    $scope.cancelEdit = function() {
        $scope.editingEvent = null; // Clear the editing event
    };

    // Function to delete an event
    $scope.deleteEvent = function(eventId) {
        EventService.removeEvent(eventId).then(function() {
            $scope.events = $scope.events.filter(e => e._id !== eventId); // Remove event from list
        }).catch(function(error) {
            console.error("Error deleting event:", error);
        });
    };
});

app.filter('currencyFilter', function() {
    return function(price, currency) {
        const conversionRates = {
            'USD': 1,
            'EUR': 0.85,
            'INR': 74.50
        };
        return (price * conversionRates[currency]).toFixed(2) + ' ' + currency;
    };
});

app.filter('eventDateFilter', function() {
    return function(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options);
    };
});
