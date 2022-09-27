class S3Utils {
    static SETTINGS = {
        CUSTOM_PREFIX: "custom_prefix",
        PATH_STYLE: "path_style",
        CUSTOM_STYLE: "custom_style",
        BUCKETNAME: "bucketname",
        CUSTOMBUCKET: "custombucket"
    }
    static ID = 's3-path-url'

    static initialize(){
        if (!game.modules.get('lib-wrapper')?.active) {
            if(game.user.isGM){
                ui.notifications.error("Module S3 Custom URL requires the 'libWrapper' module. Please install and activate it.");
            }
            return;
        }
    
        //Register Setting

        this.registerSettings();
    
        //Register Wrappers

        this.registerWrappers();
    }

    static overrideData(){
        if (!game.modules.get('lib-wrapper')?.active) {
            return;
        }
        
        if(game.settings.get(this.ID, this.SETTINGS.CUSTOM_STYLE)){
            game.data.files.s3.endpoint.hostname = game.settings.get(this.ID, this.SETTINGS.CUSTOM_PREFIX);
            game.data.files.s3.endpoint.host = game.settings.get(this.ID, this.SETTINGS.CUSTOM_PREFIX);
            game.data.files.s3.endpoint.href = game.data.files.s3.endpoint.protocol + "//" + game.settings.get(this.ID, this.SETTINGS.CUSTOM_PREFIX);
        }

    }

    static registerSettings(){
        game.settings.register(this.ID, this.SETTINGS.PATH_STYLE, {
            name: `S3_PATH_URL.settings.${this.SETTINGS.PATH_STYLE}.Name`,
            default: true,
            type: Boolean,
            scope: 'world',
            config: true,
            hint: `S3_PATH_URL.settings.${this.SETTINGS.PATH_STYLE}.Hint`,
        });
    
        game.settings.register(this.ID, this.SETTINGS.CUSTOM_PREFIX, {
            name: `S3_PATH_URL.settings.${this.SETTINGS.CUSTOM_PREFIX}.Name`,
            default: "url.to.endpoint.com",
            type: String,
            scope: 'world',
            config: true,
            hint: `S3_PATH_URL.settings.${this.SETTINGS.CUSTOM_PREFIX}.Hint`,
        });
        game.settings.register(this.ID, this.SETTINGS.BUCKETNAME, {
            name: `S3_PATH_URL.settings.${this.SETTINGS.BUCKETNAME}.Name`,
            type: String,
            scope: 'world',
            default: 'foundry',
            config: true,
            hint: `S3_PATH_URL.settings.${this.SETTINGS.BUCKETNAME}.Hint`,
        });

        game.settings.register(this.ID, this.SETTINGS.CUSTOM_STYLE, {
            name: `S3_PATH_URL.settings.${this.SETTINGS.CUSTOM_STYLE}.Name`,
            default: false,
            type: Boolean,
            scope: 'world',
            config: true,
            hint: `S3_PATH_URL.settings.${this.SETTINGS.CUSTOM_STYLE}.Hint`,
        });
        game.settings.register(this.ID, this.SETTINGS.CUSTOMBUCKET, {
            name: `S3_PATH_URL.settings.${this.SETTINGS.CUSTOMBUCKET}.Name`,
            default: false,
            type: Boolean,
            scope: 'world',
            config: true,
            hint: `S3_PATH_URL.settings.${this.SETTINGS.CUSTOMBUCKET}.Hint`,
        });
    }

    static registerWrappers(){
        libWrapper.register(this.ID, "FilePicker.upload", async function (wrapped, ...args) {
            let result = await wrapped(...args);
            if (args[0] === "s3" && !!result.path) {
                result.path = S3Utils.transformURL(result.path);
            }
            return result;
        }, libWrapper.WRAPPER);
        libWrapper.register(this.ID, "FilePicker.browse", async function (wrapped, ...args) {
            let result = await wrapped(...args);
            if (args[0] === "s3") {
                result.files?.forEach((file, index) => {
                    result.files[index] = S3Utils.transformURL(file);
                });
            }
            return result;
        }, libWrapper.WRAPPER);
        libWrapper.register(this.ID, "FilePicker.matchS3URL", function (wrapped, ...args){
            let result = wrapped(...args);
            if(result){
            if (game.settings.get('s3-path-url', "custom_style")&&game.settings.get('s3-path-url', "custombucket")){
                let bucketName = game.settings.get('s3-path-url', "bucketname");
                if(result.groups.bucket != bucketName){
                    result.groups.key = result.groups.bucket + "/" + result.groups.key;
                    result.groups.bucket = bucketName;
                }
            }
        }
            return result;
        }, libWrapper.WRAPPER);
        if (game.modules.get('moulinette-core')?.active) {
            libWrapper.register(this.ID, "game.moulinette.applications.MoulinetteFileUtil.getBaseURL", async function (wrapped, ...args){
                let result = await wrapped(...args);
                if(result != "" && result){
                    result = S3Utils.transformURL(result);
                }
                return result;
            });
        }
    }

    static transformURL(url) {
        var newUrl = url,
            tokens = newUrl.split("/"),
            path = tokens.slice(3).join("/"),
            vhostBucket = tokens[2],
            bucket = vhostBucket.split(".")[0];
    
        return this.createS3URL(bucket,path,url);
    }

    static createS3URL(bucket, filepath,url){
        let uri;
        if (!game.settings.get(this.ID, this.SETTINGS.CUSTOM_STYLE)&&game.settings.get(this.ID,this.SETTINGS.PATH_STYLE)){
            uri = 
            game.data.files.s3.endpoint.protocol + 
            "//" + 
            game.data.files.s3.endpoint.hostname + 
            "/" +
            bucket +
            "/" +
            filepath
        }
        else if(game.settings.get(this.ID, this.SETTINGS.CUSTOM_STYLE)){
            uri = game.data.files.s3.endpoint.href + "/" +  filepath;   
        }
        else {
            uri = url;
        }
        return uri;
    }
}

Hooks.once('init', async function () {
    S3Utils.initialize();
});

Hooks.once('ready', async function (){
    S3Utils.overrideData();
});

let S3PathURL = {
    createS3URL: S3Utils.createS3URL
}

window.S3PathURL = S3PathURL;