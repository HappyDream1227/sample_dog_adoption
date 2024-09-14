import { useEffect, useRef, useState, Suspense, useDebugValue, useDeferredValue } from "react"
import axios, { all } from "axios";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

// import { InputSwitch, InputSwitchChangeEvent } from 'primereact/inputswitch';

export interface Dog {
  id: string
  img: string
  name: string
  age: number
  zip_code: string
  breed: string
}
interface Location {
  zip_code: string
  latitude: number
  longitude: number
  city: string
  state: string
  county: string
}
interface Coordinates {
  lat: number;
  lon: number;
}

export default function Home() {

  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogs, setSelectedDogs] = useState<Dog[]>([])
  const [adoptedDog, setAdoptedDog] = useState<Dog | undefined>(undefined)
  const [rowClick, setRowClick] = useState<boolean>(true)

  const [breeds, setBreeds] = useState<string[]>([])
  const [curBreed, setCurBreed] = useState<string>('')
  const deferredQuery = useDeferredValue(curBreed)

  const handleCurBreed = (event: SelectChangeEvent) => {
    setCurBreed(event.target.value);
    setSelectedDogs([])
    console.log(curBreed)
  };

  let allDogs = useRef<Dog[]>([]);


  //initial loading
  useEffect(() => {
    // request for breeds
    axios.get('https://frontend-take-home-service.fetch.com/dogs/breeds', {
      withCredentials: true
    })
    .then(response => {
      // Handle successful login
      // console.log(response.data);
      setBreeds(response.data)
    })
    .catch(error => {
      alert('---------  Request Failed! ----------');
      return;
    });


    // request for dogIDs
    axios.get('https://frontend-take-home-service.fetch.com/dogs/search?sort=breed:asc', {
      withCredentials: true
    })
    .then(response => {
      const tempIds: string[] = response.data.resultIds; // Get result IDs from response
      // setNext(response.data.next);

      // request for dog data with dogIDs
      // Now that we have tempIds, we can make the POST request
      return axios.post('https://frontend-take-home-service.fetch.com/dogs', tempIds, {
        withCredentials: true
      });
    })
    .then(response => {
      // console.log("Dogs : ", response.data);
      // console.log("Dogs Typs: ", Array.isArray(response.data));
      setDogs(response.data);
    })
    .catch(error => {
      alert('---------  Request Failed! ----------');
      return;
    });


    allDogs.current = dogs
  }, [])


  // when the breed is changed
  useEffect(() => {
    let url: string = ""
    if(deferredQuery === "All") {
      setDogs(allDogs.current)
      return;
    }
    else
      url = `https://frontend-take-home-service.fetch.com/dogs/search?breeds[]=${deferredQuery}&size=10000`;

    
    axios.get(url, {
      withCredentials: true
    })
    .then(response => {
      const tempIds: string[] = response.data.resultIds; // Get result IDs from response
      // setNext(response.data.next);

      // request for dog data with dogIDs
      // Now that we have tempIds, we can make the POST request
      
      const fetchDogsByChunks = async (ids:string[]) => {
        const chunkSize = 100;
        const chunks = chunkArray(ids, chunkSize); // Split IDs into chunks
        let allDogs: Dog[] = [];

        try {
          for (const chunk of chunks) {
            const dogResponse = await axios.post('https://frontend-take-home-service.fetch.com/dogs', chunk, {
              withCredentials: true
            });
            allDogs = allDogs.concat(dogResponse.data); // Assuming response.data contains the dog objects
          }

          // console.log('Total Dogs Fetched:', allDogs.length);
          // console.log('Dogs:', allDogs);
          setDogs(allDogs); // Set the fetched dogs in state
        } catch (error) {
          console.error('Error fetching dogs:', error);
          return;
        }
      };

      // Fetch dogs using the tempIds
      fetchDogsByChunks(tempIds);
    })
    .then(response => {
      console.log('successfully received')
    })
    .catch(error => {
      alert('---------  Request Failed! ----------');
      return;
    });

  }, [deferredQuery])

  const chunkArray = (array:string[], chunkSize:number) => {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }
    return result;
  };

  const handleAdoption = () => {
    let ids:string[] = []
    selectedDogs.forEach(one => ids.push(one.id))
    // console.log(ids)

    axios.post('https://frontend-take-home-service.fetch.com/dogs/match', ids ,{
      withCredentials: true
    })
    .then(response => {
        // Handle successful login
        // console.log(response.data);
        console.log('Selected Dog ID : ',response.data.match)
        return axios.post('https://frontend-take-home-service.fetch.com/dogs', [response.data.match], {
          withCredentials: true
      });
    })
    .then(response => {
      console.log(response.data)
      setAdoptedDog(response.data[0]);
    })
    .catch(error => {
        alert('---------  Request Failed! ----------');
    });

  }

  const handleReset = () => {
    setAdoptedDog(undefined)
    setSelectedDogs([])
  }
 
  return (
    <>
      <div className="flex items-center m-10 gap-5 justify-between">
        <p className="text-[30px]">Welcome to Dog Home. Choose your best one !</p>
        <div className="flex items-center gap-5">
          <FormControl variant="standard" sx={{ m: 1, minWidth: 220 }} className="w-[200px]">
            <InputLabel id="demo-simple-select-standard-label">Breeds</InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              value={curBreed}
              onChange={handleCurBreed}
            >
              <MenuItem value="All">
                <em>All</em>
              </MenuItem>
              {breeds.map(breed => 
                <MenuItem key={breed} value={breed}>{breed}</MenuItem>
              )}
            </Select>
          </FormControl>

          <button onClick={handleAdoption} className="rounded-md px-5 py-2 bg-[#1457d2] text-white hover:bg-slate-200 hover:text-blue-600 duration-300 w-[150px]">Adopt</button>
        </div>
      </div>
      
      {adoptedDog !== undefined ?
      <div className="flex justify-center items-center gap-20 text-[28px]">
        <div className="flex flex-col items-center justify-center gap-4">
          <p>You have chosen this one !</p>
          <button onClick={handleReset} className=" text-[20px] rounded-md px-5 py-2 bg-[#1457d2] text-white hover:bg-slate-200 hover:text-blue-600 duration-300">
            Choose Another
          </button>
        </div>
        <div className="flex flex-col text-[22px] gap-4">
          <p><span>Name : {adoptedDog.name}</span><span className="ml-20">Age : {adoptedDog.age}</span><span className="ml-20">ZipCode : {adoptedDog.zip_code}</span></p>
          <p><span>Breed : {adoptedDog.breed}</span></p>
          <p>Image : </p><img className="rounded-md" src={adoptedDog.img} alt=""></img>
        </div>
      </div>
      :
      <Suspense fallback={<h2>Loading...</h2>}>
        <div className={`card `}>
          <DataTable value={dogs} paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} selectionMode={rowClick ? null : 'multiple'} selection={selectedDogs!}
            onSelectionChange={(e:any) => setSelectedDogs(e.value)} dataKey="id" tableStyle={{ minWidth: '50rem' }}>
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
            <Column field="name" header="Name" sortable ></Column>
            {/* <Column field="img" header="Image" sortable ></Column> */}
            <Column 
              field="img" 
              header="Image" 
              sortable 
              body={(rowData) => <img src={rowData.img} alt={rowData.name} style={{ width: '50px', height: '50px',borderRadius : '5px' }} />} 
            ></Column>
            <Column field="age" header="Age" sortable ></Column>
            <Column field="breed" header="Breed" sortable ></Column>
            <Column field="zip_code" header="ZipCode" sortable ></Column>
          </DataTable>
        </div>
      </Suspense>

      }
      

      
    </>
  )
            
}