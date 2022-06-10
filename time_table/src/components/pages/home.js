import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Table from "../navigation/table";

function Home() {
  let ccallcol = [];
  const [rows, setRows] = useState(null);
  const [timecol, setTimecol] = useState(null);
  const [sttime, setSttime] = useState("8:00");
  const [lsttime, setLsttime] = useState(null);
  const [lead, setLead] = useState(0);
  const [oallp, setOallp] = useState(null);

  function courseInfo(courseCode, totalLectures, l, lPr, t, tPr, p, pPr) {
    this.courseCode = courseCode;
    this.totalLectures = totalLectures;
    this.l = l;
    this.lPr = lPr;
    this.t = t;
    this.tPr = tPr;
    this.p = p;
    this.pPr = pPr;
  }

  const tempCourseInputs = [];

  for (let i = 0; i < 6; i++) {
    let course = new courseInfo("", 0, 0, "", 0, "", 0, "");
    tempCourseInputs.push(course);
  }

  const [courseInputs, setCourseInputs] = useState(tempCourseInputs);

  const addCourseInputs = (e) => {
    let course = new courseInfo("", 0, 0, "", 0, "", 0, "");
    const updatedCourseInputs = [...courseInputs, course];
    setCourseInputs(updatedCourseInputs);
  };

  let days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const [allcol, setAllcol] = useState([]);
  const [lunchStartTime, setLunchStartTime] = useState("12:30");
  const [lecturesBeforeLunch, setLecturesBeforeLunch] = useState("3");
  const [lectureStartTimes, setLectureStartTimes] = useState([]);
  const [lunchEndTimes, setLunchEndTimes] = useState([]);
  const [lecturesAfterLunch, setLecturesAfterLunch] = useState("3");

  const setPossibleStartTimes = () => {
    const arr = [];

    const splitTime = lunchStartTime.split(":");
    const splitTimeHr = parseInt(splitTime[0]);
    const splitTimeMin = parseInt(splitTime[1]);

    let maxSplitStartTime = splitTimeHr - parseInt(lecturesBeforeLunch);

    if (maxSplitStartTime <= 0) {
      maxSplitStartTime += 12;
    }

    let tempTimeHr = 8;
    let tempTimeMin = 0;

    while (tempTimeHr <= maxSplitStartTime) {
      arr.push(
        `${tempTimeHr}:${tempTimeMin < 10 ? "0" + tempTimeMin : tempTimeMin} AM`
      );
      tempTimeMin += 15;

      if (tempTimeMin === 60) {
        tempTimeHr += 1;
        tempTimeMin = 0;
      }

      if (tempTimeHr === maxSplitStartTime && tempTimeMin > splitTimeMin) {
        break;
      }
    }

    setLectureStartTimes(arr);
  };

  const setPossibleLunchEndTimes = () => {
    const arr = [];

    const splitTime = lunchStartTime.split(":");
    const splitTimeHr = parseInt(splitTime[0]);
    const splitTimeMin = parseInt(splitTime[1]);

    let tempTimeHr = splitTimeHr + 1;
    let tempTimeMin = splitTimeMin;

    if (tempTimeHr > 12) {
      tempTimeHr -= 12;
    }

    for (let i = 0; i < 3; i++) {
      arr.push(
        `${tempTimeHr}:${tempTimeMin < 10 ? "0" + tempTimeMin : tempTimeMin} PM`
      );
      tempTimeMin += 15;
      if (tempTimeMin === 60) {
        tempTimeHr += 1;
        tempTimeMin = 0;
      }
    }

    setLunchEndTimes(arr);
    setLsttime(arr[0].slice(0, -3));
  };

  useEffect(() => {
    setPossibleStartTimes();
    // eslint-disable-next-line
  }, [lecturesBeforeLunch]);

  useEffect(() => {
    setPossibleStartTimes();
    // eslint-disable-next-line

    setPossibleLunchEndTimes();
    // eslint-disable-next-line
  }, [lunchStartTime]);

  useEffect(() => {
    crtTable();
    // eslint-disable-next-line
  }, [lead]);

  console.log(allcol);

  let exportPDF = () => {
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "portrait"; // portrait or landscape

    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(20);

    const title = "Time Table";
    doc.text(title, 250, 30);
    doc.setFontSize(10);

    let headers;
    let data = [];
    let ori = 50;
    headers = [...timecol];
    headers.unshift("Day");
    console.log("headers: ", headers);
    allcol.map((col, index) => {
      data.push([]);
      data[index] = allcol[index].map((elt) => elt);
      data[index].unshift(days[index]);
      return 0;
    });

    console.log("DATA: ", data);
    let content = {
      theme: "grid",
      startY: ori,
      head: [headers],
      body: data,
    };
    doc.autoTable(content);
    doc.save("Time-Table.pdf");
  };

  console.log("timecol ", timecol);

  const [tbl, setTbl] = useState(null);

  function crtTable() {
    if (allcol.length === 0) {
      return null;
    }

    let data = [];

    let columns = [
      {
        Header: "Day",
        accessor: "col1", // accessor is the "key" in the data
      },
    ];

    for (let i = 0; i < timecol.length; i++) {
      let st = "col" + i + 2;
      let vl = {
        Header: timecol[i],
        accessor: st,
      };
      columns.push(vl);
    }

    allcol.map((col, index) => {
      let ml = {
        col1: days[index],
      };

      data.push(ml);
      for (let i = 0; i < allcol[index].length; i++) {
        let st = "col" + i + 2;
        data[index][st] = allcol[index][i];
      }

      return null;
    });

    console.log("data: ", data);
    console.log("columns", columns);

    let ntbl = <Table data={data} columns={columns} />;
    setTbl(ntbl);
  }

  console.log(sttime, lsttime);

  function handleclick() {
    let ls = [];
    let cls = [];
    let rem = 0;
    let tst;
    if (oallp === "mor") {
      tst = sttime;
      let mst = lunchStartTime;
      let splitTime1 = tst.split(":");
      let splitTime2 = mst.split(":");
      let splitTime1Hr = parseInt(splitTime1[0]) * 60;
      splitTime1Hr += parseInt(splitTime1[1]);

      let splitTime2Hr = parseInt(splitTime2[0]);

      if (splitTime2Hr >= 1 && splitTime2Hr <= 6) {
        splitTime2Hr = (splitTime2Hr + 12) * 60;
      } else {
        splitTime2Hr = splitTime2Hr * 60;
      }
      splitTime2Hr += parseInt(splitTime2[1]);
      rem = splitTime2Hr - splitTime1Hr;
      rem -= lecturesBeforeLunch * 60;
    }

    tst = sttime;
    for (let i = 0; i < lecturesBeforeLunch; i++) {
      let splitTime = tst.split(":");
      let splitTimeHr = parseInt(splitTime[0]);
      let splitTimeMin = parseInt(splitTime[1]);

      if (i === 2 && oallp === "mor" && rem !== 0) {
        let brk = 15;
        if (rem >= 60) {
          brk = 30;
          rem -= 30;
        } else {
          rem -= 15;
        }

        splitTimeMin = splitTimeMin + brk;
        if (splitTimeMin >= 60) {
          splitTimeMin = splitTimeMin % 60;
          splitTimeHr++;
        }

        let min = splitTimeMin < 10 ? "0" + splitTimeMin : splitTimeMin;
        let nst = tst + "-" + splitTimeHr + ":" + min;
        tst = splitTimeHr + ":" + min;
        cls.push(nst);
        ls.push("Break");
        splitTime = tst.split(":");
        splitTimeHr = parseInt(splitTime[0]);
        splitTimeMin = parseInt(splitTime[1]);
      }

      splitTimeHr = splitTimeHr + 1;
      if (splitTimeHr > 12) {
        splitTimeHr -= 12;
      }
      let min = splitTimeMin < 10 ? "0" + splitTimeMin : splitTimeMin;
      let nst = tst + "-" + splitTimeHr + ":" + min;
      tst = splitTimeHr + ":" + min;
      cls.push(nst);
      ls.push(null);
    }

    tst = tst + "-" + lsttime;
    cls.push(tst);
    ls.push("Lunch");

    tst = lsttime;
    for (let i = 0; i < lecturesAfterLunch; i++) {
      let splitTime = tst.split(":");
      let splitTimeHr = parseInt(splitTime[0]);
      let splitTimeMin = parseInt(splitTime[1]);

      if (i === 2 && oallp === "aft") {
        splitTimeMin = splitTimeMin + 15;
        if (splitTimeMin >= 60) {
          splitTimeMin = splitTimeMin % 60;
          splitTimeHr++;
        }
        let min = splitTimeMin < 10 ? "0" + splitTimeMin : splitTimeMin;
        let nst = tst + "-" + splitTimeHr + ":" + min;
        tst = splitTimeHr + ":" + min;
        cls.push(nst);
        ls.push("Break");
        splitTime = tst.split(":");
        splitTimeHr = parseInt(splitTime[0]);
        splitTimeMin = parseInt(splitTime[1]);
      }

      splitTimeHr = splitTimeHr + 1;
      let min = splitTimeMin < 10 ? "0" + splitTimeMin : splitTimeMin;
      let nst = tst + "-" + splitTimeHr + ":" + min;
      tst = splitTimeHr + ":" + min;
      cls.push(nst);
      ls.push(null);
    }

    setTimecol(cls);
    setAllcol([]);

    if (lecturesBeforeLunch === "4") {
      const slots4bfl = [
        [1, 5, 6, 3, 7],
        [2, 1, 7, 4],
        [3, 2, 6, 5],
        [4, 3, 7, 1],
        [5, 4, 6, 2],
      ];
      for (let i = 0; i < rows; i++) {
        let nls = [...ls];
        // console.log("Before", nls);
        let j = 0;
        for (let k = 0; k < slots4bfl[i].length; k++) {
          while (nls[j] !== null) {
            j++;
          }
          nls[j] = slots4bfl[i][k];
          j++;
        }
        // console.log("After", nls);
        ccallcol.push(nls);
        setAllcol((prev) => [...prev, nls]);
      }
    } else {
      const slots4bfl = [
        [1, 5, 3, 6, 7],
        [2, 1, 4, 7],
        [3, 2, 5, 6],
        [4, 3, 1, 7],
        [5, 4, 2, 6],
      ];
      for (let i = 0; i < rows; i++) {
        let nls = [...ls];
        // console.log("Before", nls);
        let j = 0;
        for (let k = 0; k < slots4bfl[i].length; k++) {
          while (nls[j] !== null) {
            j++;
          }
          nls[j] = slots4bfl[i][k];
          j++;
        }
        // console.log("After", nls);
        ccallcol.push(nls);
        setAllcol((prev) => [...prev, nls]);
      }
    }

    setLead((prev) => prev + 1);
  }

  console.log(ccallcol);
  console.log(allcol);

  const updateTT = () => {
    handleclick();
    let distribution = { L: {}, T: {}, P: {} };
    let lectslot = { L: new Set(), T: new Set(), P: new Set() };
    for (let i = 0; i < courseInputs.length; i++) {
      if (courseInputs[i].courseCode !== "") {
        if (courseInputs[i].l !== 0) {
          lectslot.L.add(courseInputs[i].l);
          if (distribution.L[courseInputs[i].l] !== undefined) {
            distribution.L[courseInputs[i].l].push(courseInputs[i].courseCode);
          } else {
            distribution.L[courseInputs[i].l] = [courseInputs[i].courseCode];
          }
        }

        if (courseInputs[i].t !== 0) {
          lectslot.T.add(courseInputs[i].t);

          if (distribution.T[courseInputs[i].t] !== undefined) {
            distribution.T[courseInputs[i].t].push(courseInputs[i].courseCode);
          } else {
            distribution.T[courseInputs[i].t] = [courseInputs[i].courseCode];
          }
        }

        if (courseInputs[i].p !== 0) {
          lectslot.P.add(courseInputs[i].p);
          if (distribution.P[courseInputs[i].p] !== undefined) {
            distribution.P[courseInputs[i].t].push(courseInputs[i].courseCode);
          } else {
            distribution.P[courseInputs[i].t] = [courseInputs[i].courseCode];
          }
        }
      }
    }

    console.log("dist", distribution);

    let uniquearray = Array.from(lectslot.L);
    uniquearray.sort((a, b) => a - b);
    uniquearray = uniquearray.reverse();
    console.log("unique", uniquearray);
    let dict = {};
    let remmm = 1;
    for (let i = 0; i < uniquearray.length; i++) {
      for (let j = 0; j < distribution.L[uniquearray[i]].length; j++) {
        dict[remmm] = [distribution.L[uniquearray[i]][j], uniquearray[i]];
        remmm++;
      }
    }

    console.log("Dict", dict);

    let copyallcol = [...ccallcol];

    console.log("old", copyallcol);

    for (let i = 0; i < copyallcol[0].length; i++) {
      for (let j = 0; j < copyallcol.length; j++) {
        if (copyallcol[j][i] !== null && dict[copyallcol[j][i]] !== undefined) {
          if (dict[copyallcol[j][i]][1] > 0) {
            dict[copyallcol[j][i]][1]--;
            copyallcol[j][i] = dict[copyallcol[j][i]][0];
          } else {
            copyallcol[j][i] = null;
          }
        }
      }
    }

    console.log("new", copyallcol);

    setAllcol(copyallcol);
    setLead((prev) => prev + 1);
  };

  return (
    <div className="mx-auto my-5 w-full">
      <div className={lead === 0 ? "block w-2/3 mx-auto my-16" : "hidden"}>
        <div className="bg-bck-3 text-center rounded ">
          <div className="pt-5 text-xl font-semibold">Total working days</div>
          <input
            type="number"
            name="rows"
            id="rows"
            onChange={(event) => {
              if (event.target.value < 7 && event.target.value > 0) {
                setRows(event.target.value);
              }
            }}
            value={rows}
            min={1}
            max={7}
            className="rounded  my-3 text-center outline-none text-black"
            required
          />
          {/* {rows} */}
          {/* <br /> */}
        </div>
        <div className="bg-bck-3 text-center rounded my-3 py-2">
          <div className="pt-5 text-xl font-semibold">Lunch start time</div>
          <select
            value={lunchStartTime}
            onChange={(e) => setLunchStartTime(e.target.value)}
            style={{ color: "black" }}
            id="lunchStartTime"
            name="lunchStartTime"
          >
            <option value="12:30">12:30 PM</option>
            <option value="12:45">12:45 PM</option>
            <option value="1:00">1:00 PM</option>
          </select>

          <div className="pt-5 text-xl font-semibold">
            Lectures before lunch
          </div>
          <select
            style={{ color: "black" }}
            value={lecturesBeforeLunch}
            onChange={(e) => setLecturesBeforeLunch(e.target.value)}
            id="lecturesBeforeLunch"
            name="lecturesBeforeLunch"
          >
            <option value="3">3</option>
            <option value="4">4</option>
          </select>

          <div className="pt-5 text-xl font-semibold">Lecture start time</div>
          <select
            style={{ color: "black" }}
            id="lectureStartTime"
            name="lecturesStartTime"
            onChange={(event) => {
              let tem = event.target.value;
              let st = tem.slice(0, -3);
              setSttime(st);
            }}
          >
            {lectureStartTimes.map((time) => (
              <option value={time}>{time}</option>
            ))}
          </select>

          <div className="pt-5 text-xl font-semibold">Lunch end time</div>
          <select
            style={{ color: "black" }}
            id="lunchEndTime"
            name="lunchEndTime"
            onChange={(event) => {
              let tem = event.target.value;
              let st = tem.slice(0, -3);
              // let tot = 60 * parseInt(tem.slice(0, 2)) + parseInt(tem.slice(3));
              setLsttime(st);
            }}
          >
            {lunchEndTimes.map((time) => (
              <option value={time}>{time}</option>
            ))}
          </select>

          <div className="pt-5 text-xl font-semibold">Lectures after lunch</div>
          <select
            style={{ color: "black" }}
            value={lecturesAfterLunch}
            onChange={(e) => {
              setLecturesAfterLunch(e.target.value);
            }}
            id="lecturesAfterLunch"
            name="lecturesAfterLunch"
          >
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
          <div className="pt-5 text-xl font-semibold">Priority</div>
          <select
            style={{ color: "black" }}
            value={oallp}
            onChange={(e) => {
              setOallp(e.target.value);
            }}
            id="oallp"
            name="oallp"
          >
            <option value="Selected" selected="true" disabled="disabled">
              Select
            </option>
            <option value="mor">Morning</option>
            <option value="aft">Afternoon</option>
          </select>
        </div>

        <div className="w-1/3 mx-auto align-center my-3">
          <button
            onClick={rows === null ? null : handleclick}
            className="w-full text-white bg-bck-3 hover:bg-bck-3 focus:ring-4 focus:ring-blue-300 font-medium rounded text-sm px-5 py-2.5 dark:bg-bck-3-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            Generate
          </button>
        </div>
      </div>

      {/* *************************************************************************************************************** */}
      <div className={lead !== 0 ? "block" : "hidden"}>
        <div className=" flex flex-row flex-wrap justify-evenly">
          {courseInputs.map((obj) => (
            <div className="flex flex-row justify-evenly bg-bck-3 text-center rounded mb-1 py-2 w-1/4 mx-1">
              <div className="w-full mx-1">
                <div className="text-sm font-light">Course Code</div>
                <input
                  type="text"
                  name="course_code"
                  id="course_code"
                  onChange={(event) => {
                    obj.courseCode = event.target.value;
                  }}
                  className="rounded text-center outline-none text-black w-2/4"
                  required
                />
              </div>

              <div className="flex justify-evenly">
                <div className="flex flex-col mx-2">
                  <div className=" text-sm font-bold">L</div>
                  <input
                    type="number"
                    name="lecstime"
                    id="lecstime"
                    onChange={(event) => {
                      obj.l =
                        event.target.value === ""
                          ? 0
                          : parseInt(event.target.value, 10);
                    }}
                    defaultValue={obj.l}
                    min={1}
                    max={7}
                    className="rounded mb-1 text-center outline-none text-black"
                    required
                  />

                  <select
                    style={{ color: "black" }}
                    onChange={(e) => {
                      obj.lPr = e.target.value;
                    }}
                    id="priority"
                    name="priority"
                    className="w-full"
                  >
                    <option
                      value="Select"
                      selected="true"
                      // disabled="disabled"
                    ></option>
                    <option value="morning">pre</option>
                    <option value="afternoon">post</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-bold">T</div>
                  <input
                    type="number"
                    name="tutstime"
                    id="tutstime"
                    onChange={(event) => {
                      obj.t =
                        event.target.value === ""
                          ? 0
                          : parseInt(event.target.value, 10);
                    }}
                    defaultValue={obj.t}
                    min={1}
                    max={9}
                    className="rounded  mb-1 text-center outline-none text-black"
                    required
                  />

                  <select
                    style={{ color: "black" }}
                    onChange={(e) => {
                      obj.tPr = e.target.value;
                    }}
                    id="priority"
                    name="priority"
                  >
                    <option
                      value="Select"
                      selected="true"
                      // disabled="disabled"
                    ></option>
                    <option value="morning">pre</option>
                    <option value="afternoon">post</option>
                  </select>
                </div>
                <div className="flex flex-col mx-2">
                  <div className="text-sm font-bold">P</div>
                  <input
                    type="number"
                    name="labtime"
                    id="labtime"
                    onChange={(event) => {
                      obj.p =
                        event.target.value === ""
                          ? 0
                          : parseInt(event.target.value, 10);
                    }}
                    defaultValue={obj.p}
                    min={1}
                    max={9}
                    className="rounded mb-1 text-center outline-none text-black"
                    required
                  />

                  <select
                    style={{ color: "black" }}
                    onChange={(e) => {
                      obj.pPr = e.target.value;
                    }}
                    id="priority"
                    name="priority"
                  >
                    <option
                      value="Select"
                      selected="true"
                      // disabled="disabled"
                    ></option>
                    <option value="morning">pre</option>
                    <option value="afternoon">post</option>
                  </select>
                </div>
              </div>
              <div className="mx-1 w-full">
                <div className="text-sm font-light mx-2">Lecture Time</div>
                <select
                  style={{ color: "black" }}
                  onChange={(event) => {
                    obj.totalLectures =
                      event.target.value === ""
                        ? 0
                        : parseFloat(event.target.value, 10);
                    console.log(courseInputs);
                  }}
                >
                  <option value="Select" selected>
                    Select
                  </option>
                  <option value="1">1</option>
                  <option value="1.5">1.5</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-row">
          <div className="w-1/6 mx-auto align-center my-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full text-white bg-bck-3 hover:bg-bck-3 focus:ring-4 focus:ring-blue-300 font-medium rounded text-sm px-5 py-2.5 dark:bg-bck-3-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              Back
            </button>
          </div>
          <div className="w-1/6 mx-auto align-center my-3">
            <button
              onClick={updateTT}
              className="w-full text-white bg-bck-3 hover:bg-bck-3 focus:ring-4 focus:ring-blue-300 font-medium rounded text-sm px-5 py-2.5 dark:bg-bck-3-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              Update
            </button>
          </div>
          <div className="w-1/6 mx-auto align-center my-3">
            <button
              onClick={addCourseInputs}
              className="w-full text-white bg-bck-3 hover:bg-bck-3 focus:ring-4 focus:ring-blue-300 font-medium rounded text-sm px-5 py-2.5 dark:bg-bck-3-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              Add
            </button>
          </div>
        </div>
        <div className="flex flex-col w-3/5 mx-auto">{tbl}</div>
        <div className={"w-1/3 mx-auto align-center my-3"}>
          <button
            onClick={exportPDF}
            className="w-full text-white bg-bck-3 hover:bg-bck-3 focus:ring-4 focus:ring-blue-300 font-medium rounded text-sm px-5 py-2.5 dark:bg-bck-3-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            Print Time Table
          </button>
        </div>
      </div>

      {/* ********************************************************************************************* */}
    </div>
  );
}

export default Home;
