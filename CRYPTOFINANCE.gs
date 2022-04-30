function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('CRYPTOFINANCE')
        .addItem('Refresh Prices', 'RefreshPrices')
      .addSeparator()
      .addToUi();  
}

const RefreshPrices = () => {
  
  let assetsList = getPortfolioCryptoAssets();
  let response = apiCall(assetsList);
  try {

    assetsList.forEach((name) => {
      let price = response["data"][name]["quote"]["USD"]["price"];
      savePriceIntoLocalCache(name, price);
    });


    let pricesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Crypto Prices');
    pricesSheet.getRange('I2').setValue(`${new Date().getTime() / 1000}`);

  } catch(e) {
    Logger.log(e);
  }

}

const apiCall = (assetsList) => {

      let url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=`+assetsList.join(",");
      let response = UrlFetchApp.fetch(
        url,
        {
          method: 'GET',
            headers: {
          'X-CMC_PRO_API_KEY': '<SECRET_APIKEY>'
          }
        }
      );

      response = JSON.parse(response);
      return response;

} 

const savePriceIntoLocalCache = (symbol, price) => {

  let cache = CacheService.getUserCache();

  let CACHE_KEY = `CACHED_${symbol}`;
    console.log(`Saving ${CACHE_KEY} into local cache of price ${price}`);
  cache.put(CACHE_KEY,price,21600);
  

}

const getPortfolioCryptoAssets = () => {

  const assetsRange = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Setup').getRange(52,2,50,1);

  const assets = assetsRange.getValues();

  let assetsArray = [];
  for(let i=0; i<assets.length; i++) {
    let item = assets[i][0];
    if(item && item !== "") {
      assetsArray.push(item);
    }  
  }

  return assetsArray;  
}


function cast_matrix__(el) {
  if (el === "") {
    return "-"
  }
  else if (el.map) {return el.map(cast_matrix__);}
  try {
    var out = Number(el)
    if ((out === 0 || out) && !isNaN(out)) {
      if (el.length > 1 && el[1] == 'x') {
        return el
      }
      else {
        return out
      }
    }
    else {
      return el
    }
  }
  catch (e) {return el;}
}

function CRYPTOFINANCE(market, attribute, option, refresh_cell) {

  // Sanitize input
  var market = (market+"") || "";
  var attribute = (attribute+"") || "";
  var option = (option+"") || "";
  
  // Fetch data
  try {

    var data = {};
    let CACHE_KEY = `CACHED_${market}`;
    // First check if we have a cached version
    var cache = CacheService.getUserCache();
    var cached = cache.get(CACHE_KEY);
    if (cached && cached != null && cached.length > 1) {
      console.log("In cache");
      console.log(cached);
      data = {
        value: cached,
        type: 'float'
      }
    }


    else {
      console.log("Not in cache");

    }

    var out = "-";
    if (data["type"] == "float") {
      out = parseFloat(data["value"]);
    }
    else if (data["type"] == "int") {
      out = parseInt(data["value"]);
    }
    else if (data["type"] == "csv") {
      out = Utilities.parseCsv(data["value"]);
      out = cast_matrix__(out);
    }
    else {
      out = data["value"]
    }

    return out;

  }

  catch (e) {
    var msg = e.message.replace(/https:\/\/api.*$/gi,'')
    throw new Error(msg)
  }
  
}
