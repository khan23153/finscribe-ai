sed -i "s/const initialEntities: Entity\[\] = \[/const initialEntities: Entity\[\] = \[\]/g" src/app/dashboard/ledger/page.tsx
sed -i "s/  { id: '1', name: \"Rahul Sharma\", type: \"Customer\", phone: \"9876543210\", balance: 5000 },//g" src/app/dashboard/ledger/page.tsx
sed -i "s/  { id: '2', name: \"Priya Electronics\", type: \"Supplier\", phone: \"9876543211\", balance: -12000 },//g" src/app/dashboard/ledger/page.tsx
sed -i "s/  { id: '3', name: \"Ahmed Khan\", type: \"Friend\", phone: \"9876543212\", balance: 500 },//g" src/app/dashboard/ledger/page.tsx
