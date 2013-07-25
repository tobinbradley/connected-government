<?php
// Script modified from https://gist.github.com/Kostanos/5639609
// Mostly just added the caching bit
header('Content-type: application/json');

// Set remote and local sources
$googleFeed = "https://docs.google.com/spreadsheet/pub?key=0AnX_8GeOg1_3dEJOcjVEcXFZWE5oRklMV1JGc1lrTHc&output=csv";
$feed = "doc.csv";

// Cache google doc csv locally, refreshing if older than 5 minutes
$cachefile = 'doc.csv';
$cachetime = 300;
if (!file_exists($feed) || time() - $cachetime > filemtime($feed)) {
    file_put_contents($feed, file_get_contents($googleFeed));
}

// Arrays we'll use later
$keys = array();
$newArray = array();

// Function to convert CSV into associative array
function csvToArray($file, $delimiter) {
  if (($handle = fopen($file, 'r')) !== FALSE) {
    $i = 0;
    while (($lineArray = fgetcsv($handle, 4000, $delimiter, '"')) !== FALSE) {
      for ($j = 0; $j < count($lineArray); $j++) {
        $arr[$i][$j] = $lineArray[$j];
      }
      $i++;
    }
    fclose($handle);
  }
  return $arr;
}

// Do it
$data = csvToArray($feed, ',');

// Set number of elements (minus 1 because we shift off the first row)
$count = count($data) - 1;

//Use first row for names
$labels = array_shift($data);

foreach ($labels as $label) {
  $keys[] = $label;
}

// Add Ids, just in case we want them later
$keys[] = 'id';

for ($i = 0; $i < $count; $i++) {
  $data[$i][] = $i;
}

// Bring it all together
for ($j = 0; $j < $count; $j++) {
  $d = array_combine($keys, $data[$j]);
  $newArray[$j] = $d;
}

// Print it out as JSON
echo json_encode($newArray);

?>
