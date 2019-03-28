import { company, phoneStatus } from "../gql/index.gql";
import { Localizer, Text } from "./i18n";
import { PhoneConfig } from "./phone-config-view";
import { CompanyPhones } from "./company-phones";
import { Phone } from "preact-feather";
import clsx from "clsx";
import { useSubscriptionWithQuery } from "@pql/boost";
import { useCallback, useState } from "preact/hooks";

export function Company({ id, addCompany }) {
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  const [{ data, fetching }] = useSubscriptionWithQuery(
    {
      query: {
        query: company,
        variables: { id }
      },
      subscription: {
        query: phoneStatus
      }
    },
    (data, next) => {
      const phone = data.company.phones.find(
        phone => phone.id === next.phoneStatus.phone.id
      );
      if (phone.status !== next.phoneStatus.phone.status)
        phone.status = next.phoneStatus.phone.status;
      return data;
    }
  );

  const createNew = useCallback(
    e => {
      e.preventDefault();
      setLoading(true);
      addCompany(newName).then(() => setLoading(false), () => {});
    },
    [newName]
  );

  return (
    <div class="container">
      <div>
        {fetching ? (
          <div class="card">
            <div class="card-body">
              <div class="loading loading-lg" />
            </div>
          </div>
        ) : !data || !data.company ? (
          <form onSubmit={createNew}>
            <div class="card">
              <div class="card-header">
                <div class="card-title h5">
                  <Text id="new_company" />
                </div>
              </div>
              <div class="card-body">
                <div class="form-group">
                  <label class="form-label" for="newName">
                    <Text id="name" />
                  </label>
                  <Localizer>
                    <input
                      required
                      class="form-input"
                      type="text"
                      id="newName"
                      placeholder={<Text id="name" />}
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                    />
                  </Localizer>
                </div>
              </div>
              <div class="card-footer">
                <button class={clsx("btn btn-primary", { loading: loading })}>
                  <Text id="create_company" />
                </button>
              </div>
            </div>
          </form>
        ) : (
          <CompanyPhones company={data.company} />
        )}
      </div>
      <div class="phones">
        {data && data.company ? (
          data.company.phones.map((p, id) => (
            <div bp="margin-left margin-right 6">
              <PhoneConfig phone={p} id={id} company={data.company} />
            </div>
          ))
        ) : (
          <div class="empty non-ideal">
            <div class="empty-icon">
              <Phone size={48} />
            </div>
            <p class="empty-title h5">
              <Text id="no_phones" />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// class CompanyView extends Component {
//   state = {
//     newName: "",
//     loading: false
//   };
//
//   createNew = e => {
//     e.preventDefault();
//     this.setState({ loading: true });
//     this.props
//       .addCompany(this.state.newName)
//       .catch(e => {})
//       .then(() => {
//         this.setState({ loading: false });
//       });
//   };
//
//   render({ loaded, data, error }, { newName, loading }, {}) {
//     return (
//       <div class="container">
//         <div>
//           {!loaded ? (
//             <div class="card">
//               <div class="card-body">
//                 <div class="loading loading-lg" />
//               </div>
//             </div>
//           ) : !data || !data.company ? (
//             <form onSubmit={this.createNew}>
//               <div class="card">
//                 <div class="card-header">
//                   <div class="card-title h5">
//                     <Text id="new_company" />
//                   </div>
//                 </div>
//                 <div class="card-body">
//                   <div class="form-group">
//                     <label class="form-label" for="newName">
//                       <Text id="name" />
//                     </label>
//                     <Localizer>
//                       <input
//                         required
//                         class="form-input"
//                         type="text"
//                         id="newName"
//                         placeholder={<Text id="name" />}
//                         value={newName}
//                         onChange={lst(this, "newName")}
//                       />
//                     </Localizer>
//                   </div>
//                 </div>
//                 <div class="card-footer">
//                   <button
//                     class={clsx("btn btn-primary", { "loading": loading })}
//                   >
//                     <Text id="create_company" />
//                   </button>
//                 </div>
//               </div>
//             </form>
//           ) : (
//             <CompanyPhones company={data.company} />
//           )}
//         </div>
//         <div class="phones">
//           {data && data.company ? (
//             data.company.phones.map((p, id) => (
//               <div bp="margin-left margin-right 6">
//                 <PhoneConfig phone={p} id={id} company={data.company} />
//               </div>
//             ))
//           ) : (
//             <div class="empty non-ideal">
//               <div class="empty-icon">
//                 <Phone size={48} />
//               </div>
//               <p class="empty-title h5">
//                 <Text id="no_phones" />
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }
// }
//
// export const Company = withSubscription(CompanyView, {
//   query: query(company, ({ id }) => ({ id })),
//   subscription: subscription(phoneStatus),
//   processUpdate: (data, next) => {
//     console.log('sub', data, next);
//     if (next.company)
//       return next;
//
//     // data.company.phones[next.phoneStatus.phone.id] = next.phoneStatus.phone;
//     return data;
//   }
// });
