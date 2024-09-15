import { useEffect, useRef, useState } from "react"
import axios from "axios";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { InputText } from "primereact/inputtext";
import { TabView, TabPanel } from 'primereact/tabview';
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
  const [showdogs, setShowDogs] = useState<Dog[]>([])
  const [selectedDogs, setSelectedDogs] = useState<Dog[]>([])
  const [adoptedDog, setAdoptedDog] = useState<Dog | undefined>(undefined)
  const [rowClick, setRowClick] = useState<boolean>(true)

  const [search, setSearch] = useState<string>('')
  const [breeds, setBreeds] = useState<string[]>([])
  const [curBreed, setCurBreed] = useState<string>('')

  const handleCurBreed = (event: SelectChangeEvent) => {
    setCurBreed(event.target.value);
    // setSelectedDogs([])
    console.log(curBreed)
  };

  let allDogs = useRef<Dog[]>([]);


  //initial loading
  useEffect(() => {
    const fetchData = async () => {
      let tempBreeds: string[] = []
      axios.get('https://frontend-take-home-service.fetch.com/dogs/breeds', {
        withCredentials: true
      })
      .then(response => {
          // Handle successful response
          tempBreeds = response.data;
          setBreeds(tempBreeds);
      
          const breedsQuery = tempBreeds.slice(0,10).map(breed => `breeds[]=${encodeURIComponent(breed)}`).join('&');
          console.log('1234 : ', breedsQuery)
          // Now that tempBreeds is populated, make the second request
          return axios.get(`https://frontend-take-home-service.fetch.com/dogs/search?${breedsQuery}&size=10000&sort=breed:asc`, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            withCredentials: true
        });
      })
      .then(response => {
          const tempIds: string[] = response.data.resultIds; // Get result IDs from response
          console.log("Here : ", tempIds);
      
          const fetchDogsByChunks = async (ids:string[]) => {
          const chunkSize = 100;
          const chunks = chunkArray(ids, chunkSize); // Split IDs into chunks
          let tempDogs: Dog[] = [];
  
          try {
            for (const chunk of chunks) {
              const dogResponse = await axios.post('https://frontend-take-home-service.fetch.com/dogs', chunk, {
                withCredentials: true
              });
              tempDogs = tempDogs.concat(dogResponse.data); // Assuming response.data contains the dog objects
            }
  
            setDogs(tempDogs); // Set the fetched dogs in state
            setShowDogs(tempDogs)
            allDogs.current = tempDogs
          } catch (error) {
            console.error('Error fetching dogs:', error);
            return;
          }
        };
  
        // Fetch dogs using the tempIds
        fetchDogsByChunks(tempIds);
      })
      .catch(error => {
          alert('---------  Request Failed! ----------');
          console.error(error);
      });
    };
  
    fetchData();
  }, [])


  // when the breed is changed
  useEffect(() => {
    let url: string = ""
    if(curBreed === "All") {
      console.log('current ; ' , allDogs)
      setDogs(allDogs.current)
      return;
    }
    else
      url = `https://frontend-take-home-service.fetch.com/dogs/search?breeds[]=${curBreed}&size=10000`;

    
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
        let tempDogs: Dog[] = [];

        try {
          for (const chunk of chunks) {
            const dogResponse = await axios.post('https://frontend-take-home-service.fetch.com/dogs', chunk, {
              withCredentials: true
            });
            tempDogs = tempDogs.concat(dogResponse.data); // Assuming response.data contains the dog objects
          }

          // console.log('Total Dogs Fetched:', allDogs.length);
          // console.log('Dogs:', allDogs);
          setDogs(tempDogs); // Set the fetched dogs in state
          setShowDogs(tempDogs)
        } catch (error) {
          console.error('Error fetching dogs:', error);
          return;
        }
      };

      // Fetch dogs using the tempIds
      fetchDogsByChunks(tempIds);
    })
    .then(response => {
      // console.log('successfully received')
    })
    .catch(error => {
      alert('---------  Request Failed! ----------');
      return;
    });

  }, [curBreed])


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

  const handleClearSelection = () => {
    setSelectedDogs([])
  }
  const handleReset = () => {
    setAdoptedDog(undefined)
    setSelectedDogs([])
  }

  const handleSearch = (v: string) => {
    setSearch(v)
    let tempDogs: Dog[] = [];
    tempDogs = dogs.filter(dog => dog.name.toLowerCase().includes(v.toLowerCase()))
    setShowDogs(tempDogs)
  }
 
  return (
    <>
      <div className="flex items-center m-10 gap-5 justify-between">
        <p className="text-[30px]">Welcome to Dog Home. Choose your best one !</p>
        <div className="flex items-center gap-5 justify-center">
          <InputText value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="search..." className="border-[1px] border-blue-500 h-[40px] w-[200px] pl-3" />

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
          <button onClick={handleClearSelection} className="rounded-md px-5 py-2 bg-[#1457d2] text-white hover:bg-slate-200 hover:text-blue-600 duration-300 w-[150px]">Clear Selection</button>
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
      <div className={`card `}>
        <TabView className="mx-10">
          <TabPanel header="All" >
            <DataTable value={showdogs} paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} selectionMode={rowClick ? null : 'multiple'} selection={selectedDogs!}
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
          </TabPanel>
          <TabPanel header="Selected">
          <DataTable value={selectedDogs} paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} 
             dataKey="id" tableStyle={{ minWidth: '50rem' }}>
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
          </TabPanel>
          
      </TabView>
        
      </div>

      }
      

      
    </>
  )
            
}