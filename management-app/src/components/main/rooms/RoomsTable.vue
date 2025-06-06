<script setup>
import { computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const roomData = [
  { ID: 'AKYiuyehjaso', Name: 'Room 102', Location: 'First floor' },
  { ID: 'LHopqwej', Name: 'Room 101', Location: 'First floor' },
  { ID: 'KGaushqwjha', Name: 'Room 201', Location: 'Second floor' },
  { ID: 'MNBvcxz', Name: 'Room 305', Location: 'Third floor' },
  { ID: 'PQRstuv', Name: 'Room 401', Location: 'Fourth floor' },
  { ID: 'WXYzab', Name: 'Room 103', Location: 'First floor' },
  { ID: 'CDEfgh', Name: 'Room 202', Location: 'Second floor' },
]

const columns = computed(() => {
  return props.headers.map((header) => ({
    field: header,
    header: header,
  }))
})
</script>

<template>
  <div class="primevue-table-container">
    <DataTable
      :value="roomData"
      tableStyle="min-width: 50rem"
      stripedRows
      paginator
      :rows="5"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      :class="{ 'overflow-x-auto': true }"
    >
      <Column
        field="ID"
        header="ID"
        style="width: 25%"
        :headerClass="`bg-[#7F8CAA] font-semibold`"
      ></Column>
      <Column field="Name" header="Name" style="width: 35%"></Column>
      <Column field="Location" header="Location" style="width: 35%"></Column>
      <template #empty>
        <div class="p-4 text-center text-gray-500">No data available.</div>
      </template>
    </DataTable>
  </div>
</template>

<style scoped>
.primevue-table-container {
  border-radius: 8px;
  overflow: hidden;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);
}
</style>
