/**
 * Global Namespace
 * @const
 */
var Dandy = Dandy || {};

/**
 * Dandy feud namespace
 * @const
 */
Dandy.Feud = Dandy.Feud || {};

/**
 * Search suggestion
 * @param  {String} searchTerm - the search term
 * @param  {int} maxResult - the expected number of result
 * @returns  {Promise} the promise containing search result
 */
Dandy.Feud.search = function (searchTerm, maxResult) {
	maxResult = maxResult || 10;
	var alphanumeric = new RegExp(/^[a-z0-9\s]+$/i);
	var promise = new Promise(function(resolve, reject) {
		$.ajax({
			url: "https://suggestqueries.google.com/complete/search?client=chrome&q=" + encodeURIComponent(searchTerm),
			dataType: "jsonp"
		}).done(function(data) {
			var rawResults = data[1].slice(0, maxResult);
			var filteredResults = rawResults.filter(function(rawResult) {
				return alphanumeric.test(rawResult);
			});
			var results = filteredResults.map(function(filteredResult) {
				return filteredResult.replace(new RegExp(searchTerm, "i"), "").toLowerCase().trim();
			});
			resolve(results);
		}).fail(function(jqXHR, textStatus) {
			reject(new Error(textStatus));
		});
	});

	return promise;
};
