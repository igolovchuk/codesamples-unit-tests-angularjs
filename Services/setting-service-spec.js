/**
* The setting service tests.
*/
describe('settingService Tests', function () {

    // Initialize dependencies of service.
    beforeEach(function () {
        angular.mock.module('OutlookAddinDemo');

        // Need to mock only dependencies from custom services.
        angular.mock.module(function ($provide) {

            $provide.service('storageService', function () {
                this.syncMailBoxDataAsync = jasmine.createSpy();
                this.setItem = jasmine.createSpy();
                this.getItem = jasmine.createSpy();
                this.getEncryptedItem = jasmine.createSpy();
                this.setEncryptedItem = jasmine.createSpy();
                this.removeItem = jasmine.createSpy();
            });

            $provide.service('officeService', function () {
                this.appHost = OfficeHost.webApp;
            });
        });
    });

    // Test service initialization.
    it('Setting Service is defined on initialization', inject(function (settingService) {
        // Assert.
        expect(settingService).toBeDefined();
    }));

    // Test service initialization.
    it('Setting Service saveAsync test', inject(function (settingService, storageService) {
        // Act.
        settingService.settingStorageType = StorageType.mailbox;
        settingService.saveAsync();

        settingService.settingStorageType = StorageType.database;
        settingService.saveAsync();

        settingService.settingStorageType = StorageType.local;
        settingService.saveAsync();

        // Assert.
        expect(storageService.setEncryptedItem).toHaveBeenCalledWith(StorageType.database, 'userSettings', settingService.userSettings);
        expect(storageService.setEncryptedItem).toHaveBeenCalledTimes(1);
        expect(storageService.syncMailBoxDataAsync).toHaveBeenCalledTimes(1);
    }));

    // Test service methods.
    it('Setting Service lastSelectedHostKey property test', inject(function (settingService, storageService) {
        // Arrange.
        var key = 'lastSelectedHostKey';
        var value = 'lab.domain.com';
        storageService.getItem.withArgs(StorageType.local, key).and.returnValue(value);

        // Act.
        settingService.lastSelectedHostKey = value;
        var lastSelectedHostKey = settingService.lastSelectedHostKey;

        // Assert.
        expect(storageService.setItem).toHaveBeenCalledWith(StorageType.local, key, value);
        expect(storageService.getItem).toHaveBeenCalledWith(StorageType.local, key);
        expect(lastSelectedHostKey).toEqual(value);
    }));

    // Test service methods.
    it('Setting Service defaultCabinetId property positive test', inject(function (settingService, storageService) {
        // Arrange.
        var cabinetId = 'NG-12345';
        var value = {
            'lab.domain.com': cabinetId
        };
        settingService.settingStorageType = StorageType.mailbox;
        storageService.getItem.withArgs(StorageType.mailbox, 'tokenData').and.returnValue({ hostKey: 'lab.domain.com' });
        storageService.getItem.withArgs(StorageType.mailbox, 'defaultCabinetList').and.returnValue(value);

        // Act.
        settingService.defaultCabinetId = cabinetId;
        var defaultCabinetId = settingService.defaultCabinetId;

        //Change storage type.
        settingService.settingStorageType = StorageType.database;
        settingService.defaultCabinetId = cabinetId;
        var defaultCabinetIdIOS = settingService.defaultCabinetId;

        // Assert.
        expect(storageService.setItem).toHaveBeenCalledWith(StorageType.mailbox, 'defaultCabinetList', value);
        expect(storageService.getItem).toHaveBeenCalledWith(StorageType.mailbox, 'defaultCabinetList');
        expect(defaultCabinetId).toEqual(cabinetId);
        expect(defaultCabinetIdIOS).toEqual(cabinetId);
    }));

    // Test service methods.
    it('Setting Service defaultCabinetId property negative test', inject(function (settingService, storageService) {
        // Arrange.
        settingService.userSettings = { defaultCabinetList: null };
        storageService.getItem.withArgs(StorageType.mailbox, 'defaultCabinetList').and.returnValue(null);

        // Act.
        settingService.settingStorageType = StorageType.mailbox;
        var defaultCabinetId = settingService.defaultCabinetId;

        settingService.settingStorageType = StorageType.database;
        var defaultCabinetIdIOS = settingService.defaultCabinetId;

        // Assert.
        expect(storageService.getItem).toHaveBeenCalledWith(StorageType.mailbox, 'defaultCabinetList');
        expect(defaultCabinetId).toEqual(null);
        expect(defaultCabinetIdIOS).toEqual(null);
    }));

    // Test service methods.
    it('Setting Service tokenData property test', inject(function (settingService, storageService) {
        // Arrange.
        var tokenDataValue = { hostKey: 'lab.domain.com' };

        // Act.
        settingService.settingStorageType = StorageType.mailbox;
        var tokenDataBeforeSet = settingService.tokenData;

        settingService.settingStorageType = StorageType.database;
        var tokenDataBeforeSetIOS = settingService.tokenData;

        settingService.settingStorageType = StorageType.mailbox;
        settingService.tokenData = tokenDataValue;
        var tokenDataAfterSet = settingService.tokenData;

        settingService.settingStorageType = StorageType.database;
        settingService.tokenData = tokenDataValue;
        var tokenDataAfterSetIOS = settingService.tokenData;

        // Assert.
        expect(storageService.setItem).toHaveBeenCalledWith(StorageType.mailbox, 'tokenData', tokenDataValue);
        expect(storageService.getItem).toHaveBeenCalledWith(StorageType.mailbox, 'tokenData');
        expect(storageService.getItem).toHaveBeenCalledTimes(1);
        expect(tokenDataAfterSet).toEqual(tokenDataValue);
        expect(tokenDataAfterSetIOS).toEqual(tokenDataValue);
        expect(tokenDataBeforeSet).toBeFalsy();
        expect(tokenDataBeforeSetIOS).toBeFalsy();
    }));

    // Test service methods.
    it('Setting Service loadApplicationSettingsAsync success flow test', inject(function (settingService, $httpBackend, storageService, $q) {
        // Arrange.
        var appSettings = { authConfiguration: { usePKCE: true }, storageConfiguration: { settingsStorage: { OutlookWebApp: StorageType.database } } };

        $httpBackend.whenGET(Constants.APP_SETTINGS_URL).respond(HttpStatusCode.ok, appSettings);
        storageService.getEncryptedItem.withArgs(StorageType.database, 'userSettings').and.returnValue($q.resolve(null));

        // Act. Case 1.
        settingService.loadApplicationSettingsAsync().then(function ()
        {
            // Assert.
            expect(settingService.appSettings).toBeDefined();
            expect(settingService.settingStorageType).toBeDefined();
            expect(settingService.userSettings ).toBeDefined();
            expect(settingService.appSettings).toEqual(appSettings);

            // Act. Case 2.
            appSettings.storageConfiguration.settingsStorage.OutlookWebApp = StorageType.mailbox;
            settingService.loadApplicationSettingsAsync().then(function () {
                // Assert.
                expect(storageService.getEncryptedItem).toHaveBeenCalledTimes(1);
            });
        });

        $httpBackend.flush();
    }));

    // Test service methods.
    it('Setting Service loadApplicationSettingsAsync negative flow test', inject(function (settingService, $httpBackend) {
        // Arrange.
        $httpBackend.whenGET(Constants.APP_SETTINGS_URL)
            .respond(HttpStatusCode.notFound, undefined);

        // Act.
        settingService.loadApplicationSettingsAsync().catch(function () {
            // Assert.
            expect(settingService.appSettings).toBeFalsy();
        });

        $httpBackend.flush();
    }));

    // Test service methods.
    it('Setting Service getHostData with key param test', inject(function (settingService) {
        // Arrange.
        var key = 'lab.domain.com';

        // Act.
        var hostData = settingService.getHostData(key);

        // Assert.
        expect(hostData).toBeDefined();
        expect(hostData.Id).toEqual(key);
    }));

    // Test service methods.
    it('Setting Service getHostData without key param test', inject(function (settingService, storageService) {
        // Arrange.
        var tokenDataKey = 'lab.domain.com';
        settingService.settingStorageType = StorageType.mailbox;
        storageService.getItem.withArgs(StorageType.mailbox, 'tokenData').and.returnValue({ hostKey: tokenDataKey });

        // Act.
        var hostData = settingService.getHostData();

        // Assert.
        expect(hostData).toBeDefined();
        expect(hostData.Id).toEqual(tokenDataKey);
    }));
});