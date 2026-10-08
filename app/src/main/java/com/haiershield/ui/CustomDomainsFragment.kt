package com.haiershield.ui

import android.app.AlertDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.haiershield.R
import com.haiershield.data.BlocklistManager

class CustomDomainsFragment : Fragment() {

    private lateinit var blocklistManager: BlocklistManager
    private lateinit var adapter: DomainAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? = inflater.inflate(R.layout.fragment_custom_domains, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        blocklistManager = BlocklistManager(requireContext())

        adapter = DomainAdapter(
            onRemove = { domain ->
                blocklistManager.removeCustomDomain(domain)
                refreshList()
                Toast.makeText(context, R.string.domain_removed, Toast.LENGTH_SHORT).show()
            }
        )

        val rv = view.findViewById<RecyclerView>(R.id.rv_domains)
        rv.layoutManager = LinearLayoutManager(context)
        rv.adapter = adapter

        view.findViewById<Button>(R.id.btn_add_domain).setOnClickListener {
            showAddDomainDialog()
        }

        view.findViewById<Button>(R.id.btn_reset).setOnClickListener {
            blocklistManager.resetToDefaults()
            refreshList()
        }

        refreshList()
    }

    private fun refreshList() {
        val defaults = blocklistManager.getDefaultDomains().map { Pair(it, "default") }
        val custom = blocklistManager.getCustomDomains().map { Pair(it, "custom") }
        adapter.submitList(defaults + custom)
    }

    private fun showAddDomainDialog() {
        val dialogView = LayoutInflater.from(context)
            .inflate(R.layout.dialog_add_domain, null)
        val editText = dialogView.findViewById<EditText>(R.id.et_domain)

        AlertDialog.Builder(requireContext())
            .setTitle(R.string.add_domain)
            .setView(dialogView)
            .setPositiveButton("Tambah") { _, _ ->
                val domain = editText.text.toString().trim()
                if (domain.isNotEmpty()) {
                    blocklistManager.addCustomDomain(domain)
                    refreshList()
                    Toast.makeText(context, R.string.domain_added, Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    class DomainAdapter(
        private val onRemove: (String) -> Unit
    ) : RecyclerView.Adapter<DomainAdapter.ViewHolder>() {

        private var items: List<Pair<String, String>> = emptyList()

        fun submitList(newItems: List<Pair<String, String>>) {
            items = newItems
            notifyDataSetChanged()
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_domain, parent, false)
            return ViewHolder(view)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val (domain, type) = items[position]
            holder.domainText.text = domain
            holder.typeText.text = type
            if (type == "custom") {
                holder.itemView.setOnLongClickListener {
                    onRemove(domain)
                    true
                }
            }
        }

        override fun getItemCount() = items.size

        class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val domainText: TextView = view.findViewById(R.id.tv_domain)
            val typeText: TextView = view.findViewById(R.id.tv_type)
        }
    }
}
