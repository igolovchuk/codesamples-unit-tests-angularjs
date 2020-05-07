/**
* The storage service tests.
*/
describe('storageService Tests', function () {
    /**
    * @private @type {string} The test Outlook user address.
    */
    var outlookUserAddress = 'test@outlook.com';

    // Initialize dependencies of service.
    beforeEach(function () {
        angular.mock.module('OutlookAddinDemo');

        // Need to mock only dependencies from custom services.
        angular.mock.module(function ($provide) {
            $provide.value('outlookSettings', {
                saveAsync: function (callback) { callback(true); },
                remove: jasmine.createSpy(),
                get: jasmine.createSpy(),
                set: jasmine.createSpy()
            });

            $provide.service('officeService', function () {
                this.roamingSettings = {
                    saveAsync: function (callback) { callback(true); },
                    remove: jasmine.createSpy(),
                    get: jasmine.createSpy(),
                    set: jasmine.createSpy()
                };

                this.outlookUserId = outlookUserAddress;
                this.isInsideMailBox = true;
            });

            $provide.service('$window', function () {
                this.localStorage = {
                    setItem: jasmine.createSpy(),
                    getItem: jasmine.createSpy(),
                    removeItem: jasmine.createSpy()
                };
            });

            $provide.factory('securityHelper', function () {
                return {
                    xorEncode: jasmine.createSpy().and.callFake(function (key, value) { return value; }),
                    base64: jasmine.createSpy().and.callFake(function (sourceString) { return sourceString; }),
                    xorDecode: jasmine.createSpy().and.callFake(function (key, value) { return value; }),
                    getHashedString: jasmine.createSpy().and.callFake(function (hashMethod, sourceString) { return sourceString; })
                };
            });


            $provide.factory('pouchDbProvider', function () {
                return {
                    getInstance: jasmine.createSpy().and.returnValue({
                        get: jasmine.createSpy(),
                        put: jasmine.createSpy(),
                        remove: jasmine.createSpy()
                    })
                };
            });
        });
    });

    // Test service initialization.
    it('Storage Service is defined on initialization', inject(function (storageService) {
        // Assert.
        expect(storageService).toBeDefined();
    }));

    // Test service methods.
    it('Storage Service setItem test', inject(function (storageService, officeService, $window) {
        // Arrange.
        var key = 'host';
        var value = 'lab.domain.com';
        var objectValue = { host: value };

        // Act.
        storageService.setItem(StorageType.mailbox, key, value);
        storageService.setItem(StorageType.local, key, value);
        storageService.setItem(StorageType.local, key, objectValue);

        // Assert.
        expect(officeService.roamingSettings.set).toHaveBeenCalledWith(key, value);
        expect($window.localStorage.setItem).toHaveBeenCalledWith(String.format(Constants.STORAGE_KEY_TEMPLATE, key, outlookUserAddress), value);
        expect($window.localStorage.setItem).toHaveBeenCalledWith(String.format(Constants.STORAGE_KEY_TEMPLATE, key, outlookUserAddress), JSON.stringify(objectValue));
    }));

    // Test service methods.
    it('Storage Service setEncryptedItem test', inject(function (storageService, officeService, $window, securityHelper, $q, pouchDbProvider, $rootScope) {
        // Arrange.
        var key = 'host';
        var value = 'lab.domain.com';
        var objectValue = { host: value };
        var encryptionKey = key + outlookUserAddress.split(Constants.ATSIGN_STRING)[0];

        pouchDbProvider.getInstance().get.withArgs(key).and.returnValue($q.reject({ status: HttpStatusCode.notFound }));
        pouchDbProvider.getInstance().put.and.returnValue($q.resolve());

        // Act.
        storageService.setEncryptedItem(StorageType.mailbox, key, value);
        storageService.setEncryptedItem(StorageType.local, key, value);
        storageService.setEncryptedItem(StorageType.local, key, objectValue);

        storageService.setItem(StorageType.database, key, value).then(function () {
            // Assert.
            expect(pouchDbProvider.getInstance().put).toHaveBeenCalled();
            expect(officeService.roamingSettings.set).toHaveBeenCalledWith(key, value);
            expect($window.localStorage.setItem).toHaveBeenCalledWith(String.format(Constants.STORAGE_KEY_TEMPLATE, key, outlookUserAddress), value);
            expect($window.localStorage.setItem).toHaveBeenCalledWith(String.format(Constants.STORAGE_KEY_TEMPLATE, key, outlookUserAddress), JSON.stringify(objectValue));
            expect(securityHelper.xorEncode).toHaveBeenCalledWith(encryptionKey, value);
        });

        $rootScope.$digest(); // Called to resolve all promises.
    }));

    // Test service methods.
    it('Storage Service getItem test', inject(function (storageService, officeService, $window) {
        // Arrange.
        var key = 'host';
        var value = 'lab.domain.com';
        var objectKey = 'object';
        var objectValue = { host: value };

        officeService.roamingSettings.get.withArgs(key).and.returnValue(value);
        $window.localStorage.getItem.withArgs(String.format(Constants.STORAGE_KEY_TEMPLATE, key, outlookUserAddress)).and.returnValue(value);
        $window.localStorage.getItem.withArgs(String.format(Constants.STORAGE_KEY_TEMPLATE, objectKey, outlookUserAddress)).and.returnValue(JSON.stringify(objectValue));

        // Act.
        var mailBoxValue = storageService.getItem(StorageType.mailbox, key);
        var localValue = storageService.getItem(StorageType.local, key);
        var objectStorageValue = storageService.getItem(StorageType.local, objectKey);

        // Assert.
        expect(mailBoxValue).toEqual(value);
        expect(localValue).toEqual(value);
        expect(objectStorageValue).toEqual(objectValue);
    }));

    // Test service methods.
    it('Storage Service getEncryptedItem test', inject(function (storageService, officeService, $window, $q, securityHelper, pouchDbProvider, $rootScope) {
        // Arrange.
        var key = 'host';
        var value = 'lab.domain.com';
        var objectKey = 'object';
        var objectValue = { host: value };
        var encryptionKey = objectKey + outlookUserAddress.split(Constants.ATSIGN_STRING)[0];

        officeService.roamingSettings.get.withArgs(key).and.returnValue(value);
        $window.localStorage.getItem.withArgs(String.format(Constants.STORAGE_KEY_TEMPLATE, key, outlookUserAddress)).and.returnValue(value);
        $window.localStorage.getItem.withArgs(String.format(Constants.STORAGE_KEY_TEMPLATE, objectKey, outlookUserAddress)).and.returnValue(JSON.stringify(objectValue));
        pouchDbProvider.getInstance().get.withArgs(key).and.returnValue($q.resolve({ value: value }));

        securityHelper.xorDecode.withArgs(encryptionKey, objectValue).and.returnValue(JSON.stringify(objectValue));

        // Act.
        var mailBoxValue = storageService.getEncryptedItem(StorageType.mailbox, key);
        var localValue = storageService.getEncryptedItem(StorageType.local, key);
        var objectStorageValue = storageService.getEncryptedItem(StorageType.local, objectKey);

        var databasePromise = storageService.getEncryptedItem(StorageType.database, key);

        databasePromise.then(function (dbItem) {
            // Assert.
            expect(dbItem).toBeDefined();
            expect(dbItem).toEqual(value);

            expect(mailBoxValue).toEqual(value);
            expect(localValue).toEqual(value);
            expect(objectStorageValue).toEqual(objectValue);
        });

        $rootScope.$digest(); // Called to resolve all promises.
    }));

    // Test service methods.
    it('Storage Service removeItem test', inject(function (storageService, officeService, $window) {
        // Arrange.
        var key = 'host';

        // Act.
        storageService.removeItem(StorageType.mailbox, key);
        storageService.removeItem(StorageType.local, key);

        // Assert.
        expect(officeService.roamingSettings.remove).toHaveBeenCalledWith(key);
        expect($window.localStorage.removeItem).toHaveBeenCalledWith(String.format(Constants.STORAGE_KEY_TEMPLATE, key, outlookUserAddress));
    }));

    describe('storageService database storage type related Tests', function () {

        // Angular promises are synchronous during tests,
        // $rootScope.$digest() is enough to make them settled at the end of the spec.
        afterEach(inject(function ($rootScope) {
            $rootScope.$digest(); // Called to resolve all promises.
        }));

        // Test service methods.
        it('Storage Service getItem for StorageType.database positive test', inject(function ($q, storageService, pouchDbProvider) {
            // Arrange.
            var key = 'test_key';
            var document = { value: 'value' };

            pouchDbProvider.getInstance().get.withArgs(key).and.returnValue($q.resolve(document));

            // Act.
            storageService.getItem(StorageType.database, key).then(function (dbItem) {
                // Assert.
                expect(dbItem).toBeDefined();
                expect(dbItem).toEqual(document);
            });
        }));

        // Test service methods.
        it('Storage Service getItem for StorageType.database negative test', inject(function ($q, storageService, pouchDbProvider) {
            // Arrange.
            var key = 'test_key';
            pouchDbProvider.getInstance().get.withArgs(key).and.returnValue($q.reject());

            // Act.
            storageService.getItem(StorageType.database, key).then(function (dbItem) {
                // Assert.
                expect(dbItem).toEqual(null);
            });
        }));

        // Test service methods.
        it('Storage Service removeItem for StorageType.database positive test', inject(function ($q, storageService, pouchDbProvider) {
            // Arrange.
            var key = 'test_key';
            var document = { value: 'value' };

            pouchDbProvider.getInstance().get.withArgs(key).and.returnValue($q.resolve(document));
            pouchDbProvider.getInstance().remove.withArgs(document).and.returnValue($q.resolve());

            // Act.
            storageService.removeItem(StorageType.database, key).then(function () {
                // Assert.
                expect(pouchDbProvider.getInstance().remove).toHaveBeenCalledWith(document);
            });
        }));

        // Test service methods.
        it('Storage Service removeItem for StorageType.database negative test', inject(function ($q, storageService, pouchDbProvider) {
            // Arrange.
            var key = 'test_key';
            var document = { value: 'value' };
            pouchDbProvider.getInstance().get.withArgs(key).and.returnValue($q.reject());

            // Act.
            storageService.removeItem(StorageType.database, key).then(function (result) {
                // Assert.
                expect(result).toEqual(null);
            });

            // Arrange.
            pouchDbProvider.getInstance().get.withArgs(key).and.returnValue($q.resolve(document));
            pouchDbProvider.getInstance().remove.withArgs(document).and.returnValue($q.reject());

            // Act.
            storageService.removeItem(StorageType.database, key).then(function (result) {
                // Assert.
                expect(result).toEqual(null);
            });
        }));

        // Test service methods.
        it('Storage Service setItem for StorageType.database positive test', inject(function ($q, storageService, pouchDbProvider) {
            // Arrange.
            var key = 'test_key';
            var value = 'value';

            pouchDbProvider.getInstance().get.withArgs(key).and.returnValue($q.reject({ status: HttpStatusCode.notFound}));
            pouchDbProvider.getInstance().put.and.returnValue($q.resolve());

            // Add.
            // Act.
            storageService.setItem(StorageType.database, key, value).then(function () {
                // Assert.
                expect(pouchDbProvider.getInstance().put).toHaveBeenCalled();
            });

            // Update.
            // Arrange.
            pouchDbProvider.getInstance().get.withArgs(key).and.returnValue($q.resolve({ value: value }));

            // Act.
            storageService.setItem(StorageType.database, key, value).then(function () {
                // Assert.
                expect(pouchDbProvider.getInstance().put).toHaveBeenCalled();
            });
        }));


        // Test service methods.
        it('Storage Service setItem for StorageType.database negative test', inject(function ($q, storageService, pouchDbProvider) {
            // Arrange.
            var key = 'test_key';
            var document = { value: 'value' };
            pouchDbProvider.getInstance().get.withArgs(key).and.returnValue($q.reject({}));

            // Act.
            storageService.setItem(StorageType.database, key).then(function (result) {
                // Assert.
                expect(result).toEqual(null);
            });

            // Arrange.
            pouchDbProvider.getInstance().get.withArgs(key).and.returnValue($q.resolve(document));
            pouchDbProvider.getInstance().put.and.returnValue($q.reject());

            // Act.
            storageService.setItem(StorageType.database, key).then(function (result) {
                // Assert.
                expect(result).toEqual(null);
            });

            // Arrange.
            pouchDbProvider.getInstance().get.withArgs(key).and.returnValue($q.reject({ status: HttpStatusCode.notFound }));
            pouchDbProvider.getInstance().put.and.returnValue($q.reject());

            // Act.
            storageService.setItem(StorageType.database, key).then(function (result) {
                // Assert.
                expect(result).toEqual(null);
            });
        }));
    });

    // Test service methods.
    it('Storage Service syncMailBoxDataAsync is Inside MailBox test', inject(function (storageService, $rootScope) {
        // Act.
        storageService.syncMailBoxDataAsync().then(function (result) {
            // Assert.
            expect(result).toEqual(true);
        });

        $rootScope.$digest(); // Called to resolve all promises.
    }));

    // Test service methods.
    it('Storage Service syncMailBoxDataAsync is Outside MailBox test', inject(function (storageService, $rootScope, officeService) {
        // Arrange.
        officeService.isInsideMailBox = false;

        // Act.
        storageService.syncMailBoxDataAsync().then(function (result) {
            // Assert.
            expect(result).toEqual(true);
        });

        $rootScope.$digest(); // Called to resolve all promises.
    }));
});