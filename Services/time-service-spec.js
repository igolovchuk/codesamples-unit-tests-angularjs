/**
* The time service tests.
*/
describe('timeService Tests', function () {
    // Initialize dependencies of service.
    beforeEach(function () {
        angular.mock.module('OutlookAddinDemo');
    });

    // Test service initialization.
    it('Time Service is defined on initialization', inject(function (timeService) {
        // Assert.
        expect(timeService).toBeDefined();
    }));

    // Test service functions.
    it('Time Service delay function works correctly', inject(function (timeService, $timeout) {
        // Arrange.
        var result = 0;

        // Act.
        timeService.delay(function () {
            result = 1;
        }, 5000);

        // Assert.
        expect(result).toBe(0);
        $timeout.flush(5000);
        expect(result).toBe(1);
    }));

    // Test service functions.
    it('Time Service cancel function test', inject(function (timeService, $timeout) {
        // Arrange.
        var cancellationTokenSource = new CancellationTokenSource();
        spyOn($timeout, 'cancel');

        // Act.
        timeService.delay(function () { }, 5000, cancellationTokenSource);
        cancellationTokenSource.cancel();

        // Assert.
        expect($timeout.cancel).toHaveBeenCalledWith(cancellationTokenSource.token);
    }));

    // Test service functions.
    it('Time Service cancels action if the cancel time < action execution time', inject(function (timeService, $timeout) {
        // Arrange.
        var result = 0;
        var cancelTimeImMilliseconds = 3000;
        var actionExecutionTimeInMilliseconds = 5000;

        // Act.
        timeService.cancelAfter(function (promise) {
            $timeout(function () {
                result = 1;
                promise.resolve();
            }, actionExecutionTimeInMilliseconds);
        }, cancelTimeImMilliseconds)
            .then(function () {
                // Assert.
                expect(result).toBe(0);
            });

        $timeout.flush();
    }));

    // Test service functions.
    it('Time Service rejects action if the cancelllation with token was requested', inject(function (timeService, $timeout) {
        // Arrange.
        var result = 0;
        var cancelTimeImMilliseconds = 3000;
        var actionExecutionTimeInMilliseconds = 5000;
        var cancellationTokenSource = new CancellationTokenSource();

        // Act.
        timeService.cancelAfter(function (promise) {
            $timeout(function () {
                result = 1;
                promise.resolve();
            }, actionExecutionTimeInMilliseconds);
        }, cancelTimeImMilliseconds, cancellationTokenSource)
            .then(function () {})
            .catch(function (err) {
                // Assert.
                expect(result).toBe(0);
            });

        cancellationTokenSource.cancel();
        $timeout.flush();
    }));

    // Test service functions.
    it('Time Service executes action if the cancel time > action execution time', inject(function (timeService, $timeout) {
        // Arrange.
        var result = 0;
        var cancelTimeImMilliseconds = 5000;
        var actionExecutionTimeInMilliseconds = 3000;

        // Act.
        timeService.cancelAfter(function (promise) {
            $timeout(function () {
                result = 1;
                promise.resolve();
            }, actionExecutionTimeInMilliseconds);
        }, cancelTimeImMilliseconds)
            .then(function () {
                // Assert.
                expect(result).toBe(1);
            });

        $timeout.flush();
    }));

    // Test service functions.
    it('Time Service throttle action execution for a predefined amount of time', inject(function (timeService, $timeout) {
        // Arrange.
        var result = 0;
        var throttleTime = 5000;
        var action = function () { result++; };

        // Act.
        var throttledAction = timeService.throttle(action, throttleTime);
        throttledAction();
        throttledAction();

        $timeout.flush(throttleTime);

        // Assert.
        expect(result).toBe(1);
    }));
});