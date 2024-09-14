import { useEffect, useState } from "react"
import axios from "axios";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { InputSwitch, InputSwitchChangeEvent } from 'primereact/inputswitch';

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
  const [rowClick, setRowClick] = useState<boolean>(true)

  // const [next, setNext] = useState<string>('')
  const [breeds, setBreeds] = useState<string[]>([])
  const [curBreed, setCurBreed] = useState<string>('')

  const handleCurBreed = (event: SelectChangeEvent) => {
    setCurBreed(event.target.value);
    setSelectedDogs([])
    console.log(curBreed)
  };

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
    });


    // request for dogIDs
    axios.get('https://frontend-take-home-service.fetch.com/dogs/search', {
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
    });

  }, [])

  useEffect(() => {
    let url = `https://frontend-take-home-service.fetch.com/dogs/search?breeds[]=${curBreed}&size=10000`;
    
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
    });

    // const fetchAllDogs = async () => {
    //   let allResultIds: Dog[] = []
    //   let url = `https://frontend-take-home-service.fetch.com/dogs/search?breeds[]=${curBreed}`;
  
    //   try {
    //       while (url) {
    //           const response = await axios.get(url, { withCredentials: true });
    //           allResultIds = allResultIds.concat(response.data.resultIds);
    //           url = response.data.next ? `https://frontend-take-home-service.fetch.com${response.data.next}` : '';
    //       }
  
    //       // console.log('Total Dog IDs:', allResultIds.length);
    //       // console.log('Dog IDs:', allResultIds);
          
    //       const fetchDogsByIds = async (dogIds:Dog[]) => {
    //         const chunkSize = 100;
    //         const chunks = chunkArray(dogIds, chunkSize);
    //         let allDogs: Dog[] = [];
        
    //         try {
    //             for (const chunk of chunks) {
    //                 const response = await axios.post('https://frontend-take-home-service.fetch.com/dogs', chunk, { withCredentials: true });
    //                 allDogs = allDogs.concat(response.data); // Assuming response.data contains the dog objects
    //             }
        
    //             console.log('Total Dogs Fetched:', allDogs.length);
    //             console.log('Dogs:', allDogs);
    //             // Handle the result as needed
    //             setDogs(allDogs); // Uncomment if using in a React context
    //         } catch (error) {
    //             console.error('Error fetching dogs:', error);
    //         }
    //       };

    //       fetchDogsByIds(dogs);

    //       // You can set the result to state or handle it as needed
    //       // setBreeds(allResultIds); // Uncomment if using in a React context
    //   } catch (error) {
    //       console.error('Error fetching dogs:', error);
    //   }
  // };
  
  // Call the function to fetch all dogs
  // fetchAllDogs();
  
  }, [curBreed])

  const chunkArray = (array:string[], chunkSize:number) => {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }
    return result;
  };

  const handleAdd = () => {
    let ids:string[] = []
    selectedDogs.forEach(one => ids.push(one.id))
    console.log(ids)

    axios.post('https://frontend-take-home-service.fetch.com/dogs/match', ids ,{
      withCredentials: true
    })
    .then(response => {
        // Handle successful login
        // console.log(response.data);
        console.log(response.data)
        return axios.post('https://frontend-take-home-service.fetch.com/dogs', response.data, {
          withCredentials: true
      });
    })
    .catch(error => {
        alert('---------  Request Failed! ----------');
    });

  }
 
  return (
    <>
      <div className="flex items-center">
        <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="demo-simple-select-filled-label">Breeds</InputLabel>
          <Select
            labelId="demo-simple-select-filled-label"
            id="demo-simple-select-filled"
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

        <button onClick={handleAdd} className="border-[1px] border-black rounded-md px-5 py-2">Add</button>
      </div>
      


      <div className="card">
        <DataTable value={dogs} paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} selectionMode={rowClick ? null : 'multiple'} selection={selectedDogs!}
            onSelectionChange={(e:any) => setSelectedDogs(e.value)} dataKey="id" tableStyle={{ minWidth: '50rem' }}>
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
            <Column field="name" header="Name" sortable ></Column>
            <Column field="img" header="Image" sortable ></Column>
            <Column field="age" header="Age" sortable ></Column>
            <Column field="breed" header="Breed" sortable ></Column>
            <Column field="zip_code" header="ZipCode" sortable ></Column>
        </DataTable>
      </div>
    </>

    // <div id="data-table" className="w-screen h-screen flex flex-col bg-[#131313]">
    //   <div className={`bg-[#1B1B1B] h-12 text-[#9B9B9B] font-normal flex justify-between items-center 
    //     border-[1px] border-[#2a2b2c] rounded-t-lg text-right rounded-tl-lg px-5`}>
    //       <div className="cursor-pointer hover:text-[#6E6E6E] duration-300 w-[5%] text-left">#</div>
    //       {header.map((head_item, index) => {
    //         if (index === 0)
    //           return <div key={index} className="w-[25%] cursor-pointer hover:text-[#6E6E6E] duration-300 text-left">{head_item}</div>
    //         else {
    //           return (
    //             <div key={index} className="w-[15%] cursor-pointer hover:text-[#6E6E6E] duration-300 flex items-center justify-start"
    //               onClick={() => {}}>
    //               {true &&
    //                 <svg className="w-[16px] h-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    //                   <line x1="12" y1="5" x2="12" y2="19"></line>
    //                   <polyline points="19 12 12 19 5 12"></polyline>
    //                 </svg>
    //               }
    //               { false &&
    //                 <svg className="w-[16px] h-[16px] rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    //                   <line x1="12" y1="5" x2="12" y2="19"></line>
    //                   <polyline points="19 12 12 19 5 12"></polyline>
    //                 </svg>
    //               }
                  
    //               <span>{head_item}</span>
    //             </div>
    //           )}
    //       }
    //     )}
    //   </div>

    //   {/* tbody */}
    //   <div className=" border-[1px] border-[#2a2b2c] rounded-b-lg border-t-0 mb-4">
    //     <div className={`rounded-lg px-5 bg-[#131313] cursor-pointer hover:bg-[#303030]  h-16 text-white font-normal text-[14px] text-start 
    //     flex justify-between items-center`}>
    //       <span className="w-[5%] text-left">213</span>
    //       <div className="w-[25%] flex cursor-pointer py-2 group justify-start items-center gap-2 overflow-y-hidden" >
    //         <span className="text-white font-semibold">234/</span>
    //       </div>
    //       <span className="w-[15%]">2</span>
    //       <span className="w-[15%]">5%</span>
    //       <span className="w-[15%]">7%</span>
    //       <span className="w-[15%]">9</span>
    //     </div>
    //   </div>

      
    // </div>
  )
            
}