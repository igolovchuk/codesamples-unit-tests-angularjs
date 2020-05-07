/**
* The notification service tests.
*/
describe('notificationService Tests', function () {
    /**
    * @private @type {Angular.$controller} The context where need to show notification.
    */
    var uiContext;

    // Initialize dependencies of service.
    beforeEach(function () {
        angular.mock.module('OutlookAddinDemo');

        // Need to mock only dependencies from custom services.
        angular.mock.module(function ($provide) {
            $provide.service('timeService', function () {
                this.delay = function (action, delayTime, cancellationTokenSource) {
                    action();
                };
            });

            $provide.service('officeService', function () {
                this.isMobile = false;
                this.closeAddin = jasmine.createSpy();
            });
        });
    });

    // Initialize defaults of service.
    beforeEach(inject(function (notificationService) {
        uiContext = {};
        notificationService.initialize(uiContext);
    }));

    // Test service initialization.
    it('Notification Service is defined on initialization', inject(function (notificationService) {
        // Assert.
        expect(notificationService).toBeDefined();
    }));

    // Test service methods.
    it('Notification Service show sucess Filing Notification', inject(function (notificationService) {
        // Act.
        notificationService.showFilingNotification(FilingStatus.succeeded);

        // Assert.
        expect(uiContext.notificationType).toEqual(NotificationType.success);
        expect(uiContext.notificationText).toEqual(Constants.FILING_NOTIFICATION_SUCCESS);
        expect(uiContext.notificationFadeoutTime).toEqual(Constants.NOTIFICATION_SUCCESS_FADEOUT_TIME);
        expect(uiContext.notificationCloseIcon).toEqual(Constants.NOTIFICATION_CLOSE_ICON_WHITE);
    }));

    // Test service methods.
    it('Notification Service show info Filing Notification', inject(function (notificationService, officeService) {
        // Arrange.
        officeService.isMobile = true;

        // Act.
        notificationService.showFilingNotification(FilingStatus.active);

        // Assert.
        expect(uiContext.notificationType).toEqual(NotificationType.info);
        expect(uiContext.notificationText).toEqual(Constants.FILING_NOTIFICATION_IN_PROGRESS);
        expect(uiContext.notificationFadeoutTime).toEqual(Constants.NOTIFICATION_NO_FADEOUT);
        expect(uiContext.notificationCloseIcon).toEqual(Constants.NOTIFICATION_CLOSE_ICON_BLACK);
        expect(uiContext.notificationSubText).toEqual(Constants.FILING_NOTIFICATION_IN_PROGRESS_SUB_TEXT);
        expect(uiContext.notificationAction).toEqual(officeService.closeAddin);

    }));

    // Test service methods.
    it('Notification Service show error Filing Notification', inject(function (notificationService) {
        // Act.
        notificationService.showFilingNotification(FilingStatus.failed);

        // Assert.
        expect(uiContext.notificationType).toEqual(NotificationType.error);
        expect(uiContext.notificationText).toEqual(Constants.FILING_NOTIFICATION_ERROR);
        expect(uiContext.notificationFadeoutTime).toEqual(Constants.NOTIFICATION_ERROR_FADEOUT_TIME);
        expect(uiContext.notificationCloseIcon).toEqual(Constants.NOTIFICATION_CLOSE_ICON_WHITE);
    }));

    // Test service methods.
    it('Notification Service show success Final Filing Notification', inject(function (notificationService) {
        // Act.
        notificationService.showFinalFilingNotification(true);

        // Assert.
        expect(uiContext.notificationType).toEqual(NotificationType.success);
        expect(uiContext.notificationText).toEqual(Constants.FILING_NOTIFICATION_SUCCESS);
        expect(uiContext.notificationFadeoutTime).toEqual(Constants.NOTIFICATION_SUCCESS_FADEOUT_TIME);
        expect(uiContext.notificationCloseIcon).toEqual(Constants.NOTIFICATION_CLOSE_ICON_WHITE);
    }));

    // Test service methods.
    it('Notification Service show error Final Filing Notification', inject(function (notificationService) {
        // Act.
        notificationService.showFinalFilingNotification(false);

        // Assert.
        expect(uiContext.notificationType).toEqual(NotificationType.error);
        expect(uiContext.notificationText).toEqual(Constants.FILING_NOTIFICATION_ERROR);
        expect(uiContext.notificationFadeoutTime).toEqual(Constants.NOTIFICATION_ERROR_FADEOUT_TIME);
        expect(uiContext.notificationCloseIcon).toEqual(Constants.NOTIFICATION_CLOSE_ICON_WHITE);
    }));

    // Test service methods.
    it('Notification Service show warning notification', inject(function (notificationService) {
        // Arrange.
        var notificationText = 'test';
        var notificationFadeoutTime = null;

        // Act.
        notificationService.showWarningNotification(notificationText, notificationFadeoutTime);

        // Assert.
        expect(uiContext.notificationType).toEqual(NotificationType.warning);
        expect(uiContext.notificationText).toEqual(notificationText);
        expect(uiContext.notificationFadeoutTime).toEqual(Constants.NOTIFICATION_DEFAULT_FADEOUT_TIME);
        expect(uiContext.notificationCloseIcon).toEqual(Constants.NOTIFICATION_CLOSE_ICON_BLACK);
    }));

    // Test service methods.
    it('Notification Service doesnt show notification with invalid data', inject(function (notificationService) {
        // Arrange.
        var notificationText = null;
        var notificationFadeoutTime = null;

        // Act.
        notificationService.showInfoNotification(notificationText, notificationFadeoutTime);

        // Assert.
        expect(uiContext.notificationType).toEqual(undefined);
        expect(uiContext.notificationText).toEqual(undefined);
        expect(uiContext.notificationFadeoutTime).toEqual(undefined);
        expect(uiContext.notificationCloseIcon).toEqual(undefined);
    }));


    // Test service methods.
    it('Notification Service hide notifications test', inject(function (notificationService) {
        // Arrange.
        uiContext.showNotification = true;
            
        // Act.
        notificationService.hideNotifications();

        // Assert.
        expect(uiContext.showNotification).toEqual(false);
    }));

    // Test service methods.
    it('Notification Service cancellation notifications test', inject(function (notificationService, timeService) {
        // Arrange.
        spyOn(timeService, 'delay');

        // Act.
        notificationService.showInfoNotification('text', 5000);
        notificationService.showInfoNotification('text more', 5000);

        // Assert.
        expect(timeService.delay).toHaveBeenCalledTimes(2);
        expect(timeService.delay).toHaveBeenCalledWith(jasmine.any(Function), 5000, jasmine.any(CancellationTokenSource));
    }));
});