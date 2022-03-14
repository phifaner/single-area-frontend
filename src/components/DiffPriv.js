// import { fetch as fetchPolyfill } from 'whatwg-fetch';

// function avgFunction(elements) {
//     // let sum = 0;
//     // let count = 0;
//     // elements.forEach((e) => { 
//     //     // console.log(e);S
//     //     if (e === undefined) return;
//     //     sum += e.count; 
//     //     count++ 
//     // });
//     // return sum / count;
//     let newMap = elements.map((e) => {
//         if (e !== undefined)
//             return e.count;
//     });
//     return newMap;
// }
export async function differential(mytracks) {
    let privateTracks = [];

    const url = "http://localhost:8080/privacy/demo";
    // fetchPolyfill().then(async () => {
        fetch(url, {
            method: "POST", // *Type of request GET, POST, PUT, DELETE
            mode: "no-cors", // Type of mode of the request
            cache: "no-cache", // options like default, no-cache, reload, force-cache
            credentials: "include", // options like include, *same-origin, omit
            headers: {
                "Content-Type": "application/json" // request content type
            },
            redirect: "follow", // manual, *follow, error
            referrerPolicy: "no-referrer", // no-referrer, *client
            body: JSON.stringify(mytracks) // Attach body with the request
        }).then(response => {
            response.json().then(data => {
                privateTracks = data;
                // const status = response.status;
                console.log(privateTracks);
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            // return response.blob();
        }).catch(error => {
            console.error(
                "There has been a problem with your fetch operation:",
                error
            );
        });
    // }).catch((err) => console.error(err));

    return privateTracks;
}

// export function doDifferentialPrivacy(tracks) {
//     if (tracks === undefined || tracks.length === 0) return;

//     // send request to server and retrieve private data
//     // const xhr = new XMLHttpRequest();
//     // const url = "http://localhost:8080/privacy/demo?count=" 
//     //     + encodeURIComponent(JSON.stringify({"1-2": 30, "3-4": 50}));
//     // xhr.open("GET", url, true);
//     // xhr.setRequestHeader("Content-Type", "application/json");
//     // xhr.withCredentials = false;

//     // xhr.onreadystatechange = function () {
//     //     if (xhr.readyState === 4 && xhr.status === 200) {
//     //         var json = JSON.parse(xhr.responseText);
//     //         console.log(json);
//     //     }
//     // };
//     // xhr.send();
   
//     // $.ajax({
//     //     type: 'POST',
//     //     crossDomain: true,
//     //     dataType: 'jsonp',
//     //     data: JSON.stringify({"1-2": 30, "3-4": 50}),
//     //     url: 'http://localhost:8080/privacy/demo',
//     //     success: function(jsondata){
//     //         console.log(jsondata);
//     //     },
//     //     error: function(err) {
//     //         console.log(err);
//     //     }
//     //  })

//     // // the newKeyValueView() efficiently wraps JS Associative Arrays
//     // const toHideAsView = newKeyValueView(tracks);

//     // // Let's define a sensitive function that we
//     // // want to add just enough noise to in order
//     // // to guarantee epsilon-differential privacy
//     // const sensitiveFunction = avgFunction
//     // const privateAvg = privatize(sensitiveFunction, {
//     //     maxEpsilon: 1,
//     //     /*
//     //     * Spread out maxEpsilon information over this many 
//     //     * valid private function invokations. After 10
//     //     * private function calls, a PrivacyBudgetExceededError
//     //     * will be thrown, preventing excess data leakage.
//     //     */
//     //     maxCallCount: 10*tracks.length, 
//     //     newShadowIterator: toHideAsView.newShadowIterator,
//     //     debugDangerously: true
//     // });

//     // const privateResult= await privateAvg(toHideAsView);

//     // console.log(privateResult.result);
//     // console.log(privateResult.privateResult);
//     // console.log(privateResult);
//     // // Result will be centered around 3.0 with lots of noise added
//     // return privateResult.result;
// }
