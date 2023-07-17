class Cache {
    static DEFAULT = 0;
    static JSON = 1;

    static map = new Map();

    static setSessionValue(key, value, type = Cache.DEFAULT){
        if(type == Cache.JSON){
            this.map.set(key,JSON.stringify(value));
        }
        else{
            this.map.set(key,value);
        }
    }

    static getSessionValue(key, type = Cache.DEFAULT){
        if(this.map.has(key)){
            console.log(key)
            try{
                if(type == Cache.JSON){
                    return JSON.parse(this.map.get(key));
                }
                else{
                    return this.map.get(key);
                }
            }
            catch(err){
                return undefined;
            }
        }
        else{
            return undefined;
        }
    }

    static clearSession(){
        this.map.clear();
    }
}

export default Cache;