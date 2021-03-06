function runTest(config,qualifier) {

    // Create a session and call generateRequest() temporary,  |initDataType|
    // and |initData|. generateRequest() should fail temporary,  an
    // InvalidAccessError. Returns a promise that resolves successfully
    // if the error happened, rejects otherwise.
    function test_session(keysystem,initDataType, initData)
    {
        return isInitDataTypeSupported(initDataType).then(function(result) {
            // If |initDataType| is not supported, simply succeed.
            if (!result)
                return Promise.resolve('Not supported');

            return navigator.requestMediaKeySystemAccess( keysystem, getSimpleConfigurationForInitDataType(initDataType)).then(function(access) {
                return access.createMediaKeys();
            }).then(function(mediaKeys) {
                var mediaKeySession = mediaKeys.createSession();
                return mediaKeySession.generateRequest(initDataType, initData);
            }).then(function() {
                assert_unreached('generateRequest() succeeded');
            }, function(error) {
                assert_equals(error.name, 'InvalidAccessError');
                return Promise.resolve('success');
            });
        })
    }

    promise_test(function()
    {
        var initData = new Uint8Array(70000);
        return test_session(config.keysystem,'webm', initData);
    }, testnamePrefix( qualifier, config.keysystem ) + ', temporary, webm, initData longer than 64Kb characters');

    promise_test(function()
    {
        var initData = new Uint8Array(70000);
        return test_session(config.keysystem,'cenc', initData);
    }, testnamePrefix( qualifier, config.keysystem ) + ', temporary, cenc, initData longer than 64Kb characters');

    promise_test(function()
    {
        var initData = new Uint8Array(70000);
        return test_session(config.keysystem,'keyids', initData);
    }, testnamePrefix( qualifier, config.keysystem ) + ', temporary, keyids, initData longer than 64Kb characters');

    promise_test(function()
    {
        // Invalid 'pssh' box as the size specified is larger than what
        // is provided.
        var initData = new Uint8Array([
            0x00, 0x00, 0xff, 0xff,                          // size = huge
            0x70, 0x73, 0x73, 0x68,                          // 'pssh'
            0x00,                                            // version = 0
            0x00, 0x00, 0x00,                                // flags
            0x10, 0x77, 0xEF, 0xEC, 0xC0, 0xB2, 0x4D, 0x02,  // Common SystemID
            0xAC, 0xE3, 0x3C, 0x1E, 0x52, 0xE2, 0xFB, 0x4B,
            0x00, 0x00, 0x00, 0x00                           // datasize
        ]);
        return test_session(config.keysystem,'cenc', initData);
    }, testnamePrefix( qualifier, config.keysystem ) + ', temporary, cenc, invalid initdata (invalid pssh)');

    promise_test(function()
    {
        // Invalid data as type = 'psss'.
        var initData = new Uint8Array([
            0x00, 0x00, 0x00, 0x00,                          // size = 0
            0x70, 0x73, 0x73, 0x73,                          // 'psss'
            0x00,                                            // version = 0
            0x00, 0x00, 0x00,                                // flags
            0x10, 0x77, 0xEF, 0xEC, 0xC0, 0xB2, 0x4D, 0x02,  // Common SystemID
            0xAC, 0xE3, 0x3C, 0x1E, 0x52, 0xE2, 0xFB, 0x4B,
            0x00, 0x00, 0x00, 0x00                           // datasize
        ]);
        return test_session(config.keysystem,'cenc', initData);
    }, testnamePrefix( qualifier, config.keysystem ) + ', temporary, cenc, invalid initdata (not pssh)');

    promise_test(function()
    {
        // Valid key ID size must be at least 1 character for keyids.
        var keyId = new Uint8Array(0);
        var initData = stringToUint8Array(createKeyIDs(keyId));
        return test_session(config.keysystem,'keyids', initData);
    }, testnamePrefix( qualifier, config.keysystem ) + ', temporary, keyids, invalid initdata (too short key ID)');

    promise_test(function()
    {
        // Valid key ID size must be less than 512 characters for keyids.
        var keyId = new Uint8Array(600);
        var initData = stringToUint8Array(createKeyIDs(keyId));
        return test_session(config.keysystem,'keyids', initData);
    }, testnamePrefix( qualifier, config.keysystem ) + ', temporary, keyids, invalid initdata (too long key ID)');
}
