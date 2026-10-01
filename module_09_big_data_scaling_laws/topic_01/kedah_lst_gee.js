// DIGIHAZ Module 09 — LST Exercise: Kedah, Malaysia
var roi = ee.Geometry.Rectangle([99.6, 5.6, 101.0, 6.8]);
Map.centerObject(roi, 9);
Map.setOptions('HYBRID');

var landsat = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .filterBounds(roi)
  .filterDate('2023-01-01', '2023-12-31')
  .filter(ee.Filter.lt('CLOUD_COVER', 15));
print('Image count:', landsat.size());

function applyScaleFactors(image) {
  var thermal = image.select('ST_B10').multiply(0.00341802).add(149.0);
  return image.addBands(thermal, null, true);
}
function getLST(image) {
  var lst = image.select('ST_B10').subtract(273.15).rename('LST_Celsius');
  return image.addBands(lst);
}
var lstCollection = landsat.map(applyScaleFactors).map(getLST);
var lstMedian = lstCollection.select('LST_Celsius').median().clip(roi);
var lstVis = {min:22, max:42, palette:['001a70','3b82f6','fde047','f97316','991b1b']};
Map.addLayer(lstMedian, lstVis, 'LST 2023 (C)');

var reducers = ee.Reducer.mean()
  .combine({reducer2:ee.Reducer.min(), sharedInputs:true})
  .combine({reducer2:ee.Reducer.max(), sharedInputs:true})
  .combine({reducer2:ee.Reducer.stdDev(), sharedInputs:true});
var stats = lstMedian.reduceRegion({reducer:reducers, geometry:roi, scale:30, maxPixels:1e13});
print('Kedah LST statistics (C):', stats);

function getNDVI(image) {
  var optical = image.select(['SR_B4','SR_B5']).multiply(0.0000275).add(-0.2);
  var ndvi = optical.normalizedDifference(['SR_B5','SR_B4']).rename('NDVI');
  return image.addBands(ndvi);
}
var ndviMedian = landsat.map(getNDVI).select('NDVI').median().clip(roi);
Map.addLayer(ndviMedian, {min:-0.2,max:0.8,palette:['8c510a','dfc27d','80cdc1','01665e']}, 'NDVI 2023');

var legend = ui.Panel({style:{position:'bottom-left',padding:'8px 15px'}});
legend.add(ui.Label({value:'LST (C)',style:{fontWeight:'bold',fontSize:'14px'}}));
legend.add(ui.Label('22 C  →  42 C'));
Map.add(legend);

Export.image.toDrive({image:lstMedian,description:'LST_Kedah_2023',folder:'GEE_Exports',region:roi,scale:30,crs:'EPSG:32647',maxPixels:1e13,fileFormat:'GeoTIFF'});
Export.image.toDrive({image:ndviMedian,description:'NDVI_Kedah_2023',folder:'GEE_Exports',region:roi,scale:30,crs:'EPSG:32647',maxPixels:1e13,fileFormat:'GeoTIFF'});
