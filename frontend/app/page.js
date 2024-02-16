"use client"

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'

import Plot from 'react-plotly.js';
import axios from 'axios';
import Papa from 'papaparse';

import { Table, Select } from 'antd';
const { Option } = Select;

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Home() {

  /*####################
  # Define the backend port
  ####################*/
  const BACKEND_PORT = 8080

  /*####################
  # The following code is used to setup initial variables
  ####################*/
  // We have "csvData", "setCsvData" ; "pcaPlotData", "setPcaPlotData" ;  etc.
  // The "setSomething" function is used to update the "something"
  // For example, at the beginning, something = "123", then setSomething("abcdef") will update something, then something = "abcdef"
  // The "useState" function is a React hook function that is used to create the combo of "something" and "setSomething"
  const [csvData, setCsvData] = useState([]);
  const [screePlotData, setScreePlotData] = useState(null);
  const [pcaPlotData, setPcaPlotData] = useState(null);

  const [nameOfSamplesInPCAPlot, setNameOfSamplesInPCAPlot]
    = useState([]);
  const [colorGroupsOfPcaPlot, setColorGroupsOfPcaPlot] = useState([
    {
      name: "Group 1",
      colorCode: "#272E3F",
    },
    {
      name: "Group 2",
      colorCode: "#FFFF00",
    },
  ]);
  // This option is the required format to use <Select> of antd library
  const [options, setOptions] = useState([
    {
      label: "Group 1",
      value: "#272E3F",
    },
    {
      label: "Group 2",
      value: "#FFFF00",
    },
  ]);

  /*####################
  # The following code is about generating data: generateRandomData, generateScreePlot, generatePCAPlot, etc.
  ####################*/

  //  Generate random data function
  const generateRandomData = async () => {
    try {
      // Send a GET request to the backend to generate random data
      // then backend will return the random data
      // then put the random generated data to the "csvData" by using "setCsvData"
      const response = await axios.get(`http://localhost:${BACKEND_PORT}/api/generate_data`);
      setCsvData(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  // Generate Scree plot function
  const generateScreePlot = async () => {
    try {
      // Send a POST request with the "csvData" to the backend
      // then backend will return the scree plot data
      // then put the scree plot data to the "screePlotData" by using "setScreePlotData"
      const response = await axios.post(`http://localhost:${BACKEND_PORT}/api/generate_scree_plot`, csvData);
      setScreePlotData(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  //  Generate PCA plot function
  const generatePCAPlot = async () => {
    try {
      const response = await axios.post(`http://localhost:${BACKEND_PORT}/api/generate_pca`, csvData);
      setPcaPlotData(response.data);
      // Extract the names of the samples in the PCA plot
      const names = []
      response.data.data.forEach((eachItem, index) => {
        names.push({
          name: eachItem.name,
          groupId: ""
        })
      })
      setNameOfSamplesInPCAPlot(names);
    } catch (error) {
      console.error(error);
    }
  }

  // Generate Loadings plot
  const generateLoadingsPlot = async () => {
    try {
      const response = await axios.post(`http://localhost:${BACKEND_PORT}/api/generate_loadings_plot`, csvData);
      setPcaPlotData(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  /*####################
  # The following code is used to handle the the file that user uploaded
  ####################*/
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    // Checking if the file is a csv file or the txt file
    // If .csv or .txt file, then continue
    if (file.type === 'text/csv' || file.type === 'text/plain') {
      // Using PapaParse, a library used for parsing, to parse the file
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          // Then set the parsed data to the csvData
          setCsvData(results.data);
        },
      });
    }
  };

  /*####################
  # The following code is to convert the data from the csv file that user uploaded to the format required by Ant Design Table
  ####################*/
  //  The Ant Design Table belongs to the library "antd" which is used for the UI. Link: https://ant.design/components/table
  // Convert csvData to the tableDataForAntdTable format required by Ant Design Table
  const tableDataForAntdTable = csvData.map((eachRow, index) => ({
    key: index,
    ...eachRow,
  }));
  // Set the columns for the Ant Design Table
  const columnsForAntdTable = csvData.length > 0 ? Object.keys(csvData[0]).map(key => ({
    title: key,
    dataIndex: key,
    key: key,
    width: 150,
  })) : [];

  console.log("🚀🚀🚀 pca plot data", pcaPlotData)
  console.log("nameOfSamplesInPCAPlot", nameOfSamplesInPCAPlot)

  /*####################
  # The following code is only about function used to render the UI: renderButtonGenerateRandomData, renderButtonUploadFile, etc.
  ####################*/
  const renderButtonGenerateRandomData = () => {
    return (
      <Button onClick={generateRandomData} >
        Generate random data
      </Button>
    )
  }

  const renderButtonUploadFile = () => {
    return (
      <Input
        type='file'
        accept='.csv,.txt'
        onChange={handleFileUpload}
      />
    )
  }

  const renderButtonGenerateScreePlot = () => {
    return (
      <Button onClick={generateScreePlot} >
        Generate Scree plot
      </Button>
    )
  }

  const renderButtonGeneratePCAPlot = () => {
    return (
      <Button onClick={generatePCAPlot}>
        Generate PCA plot
      </Button>
    )
  }

  const renderButtonGenerateLoadingsPlot = () => {
    return (
      <Button onClick={generateLoadingsPlot}>
        Generate Loadings plot
      </Button>
    )
  }

  const renderScreePlot = () => {
    if (screePlotData) {
      return (
        <div className='p-3 border border-gray-200 rounded-lg'>
          <Plot
            useResizeHandler
            style={{ width: "100%", height: "100%" }}
            data={screePlotData.data}
            layout={screePlotData.layout}
          />
        </div>
      )
    }
  }

  const renderPCAPlot = () => {
    if (pcaPlotData) {
      return (
        <div className='p-3 border border-gray-200 rounded-lg'>
          <Plot
            useResizeHandler
            style={{ width: "100%", height: "100%" }}
            data={pcaPlotData.data}
            layout={pcaPlotData.layout}
            // key={Math.random()} is very important here, because it will force the Plot to re-render when the data is changed. Otherwise, the Plot will not re-render, so the color of the samples will not be updated.
            key={Math.random()}
          />
        </div>
      )
    }
  }

  const renderNumberSamples = () => {
    return (
      <p>
        Number of samples: <strong>{csvData ? csvData.length : "0"}</strong>
      </p>
    )
  }

  const renderDataTable = () => {
    return (
      <Table
        columns={columnsForAntdTable}
        dataSource={tableDataForAntdTable}
        scroll={{
          x: 1500,
        }}
        sticky={{
          offsetHeader: 64,
        }}
      />
    )
  }

  /*####################
  # The following code is only about COLORS, such as renderColorCardsForPCAPlot, handleColorChange, etc.
  ####################*/



  const handleColorGroupChange = (index, newColor) => {
    // Copy the 'colorGroupsOfPcaPlot' array
    const updatedGroups = [...colorGroupsOfPcaPlot];
    // Update the 'colorCode' of the respective group
    updatedGroups[index].colorCode = newColor;
    // Update the state with the modified array
    setColorGroupsOfPcaPlot(updatedGroups);
  };


  const renderColorGroups = () => {
    if (pcaPlotData) {
      return (
        <div className='grid grid-cols-4 gap-4'>
          {colorGroupsOfPcaPlot.map((eachColorGroup, indexOfEachColorGroup) => (
            <div
              key={indexOfEachColorGroup}
              className='flex gap-4 items-center'
            >
              <h3>{eachColorGroup.name}</h3>
              <Input
                type="color"
                className='cursor-pointer w-1/3'
                value={eachColorGroup.colorCode}
                onChange={(e) => handleColorGroupChange(indexOfEachColorGroup, e.target.value)}
              />
            </div>
          ))}
        </div>
      );
    }
  }

  const handleSampleGroupChange = (sampleName, colorCode) => {
    // Log the sample name and color code
    console.log("🚀🚀🚀 sampleName", sampleName)
    console.log("🚀🚀🚀 e", colorCode)

    const newPcaPlotData = { ...pcaPlotData }
    console.log("🚀🚀🚀 newPcaPlotData", newPcaPlotData)

    // Find the index of the sample in the pcaPlotData array
    const index = newPcaPlotData.data.findIndex(sample => sample.name === sampleName);

    console.log("🚀🚀🚀 index", index)

    // If the sample is found in the array
    if (index !== -1) {
      // Update the color field of the sample
      newPcaPlotData.data[index].marker.color = colorCode;
    }

    console.log("🚀🚀🚀 newPcaPlotData", newPcaPlotData)

    // Update the state with the new array
    setPcaPlotData(newPcaPlotData);
  }


  const renderNameOfSamplesInPCAPlotWithGroupColorChoice = () => {
    return (
      <div className='grid grid-cols-3 gap-x-6 gap-y-3'>
        {nameOfSamplesInPCAPlot.map((sample, index) => {
          return <div
            key={index}
            className='grid grid-cols-2 items-center'
          >
            <p>{sample.name}</p>

            <Select
              onChange={(colorCode) => handleSampleGroupChange(sample.name, colorCode)}
              className='w-3/5'
              options={options}
            />
          </div>
        })}
      </div>
    )
  }

  /*####################
  # The following code is to render the final UI of the page
  ####################*/
  return (
    <div className='container my-4 flex flex-col gap-5'>

      <div className="flex py-3 justify-between sticky top-1 z-10 bg-opacity-50 backdrop-filter backdrop-blur bg-white">
        <div className='flex gap-2'>
          {renderButtonGenerateRandomData()}
          {renderButtonUploadFile()}
        </div>

        <div className='flex gap-2'>
          {renderButtonGenerateScreePlot()}
          {renderButtonGeneratePCAPlot()}
          {renderButtonGenerateLoadingsPlot()}
        </div>
      </div>

      {renderScreePlot()}

      {renderColorGroups()}
      {renderNameOfSamplesInPCAPlotWithGroupColorChoice()}
      {renderPCAPlot()}

      {renderNumberSamples()}
      {renderDataTable()}
    </div>
  );
}
